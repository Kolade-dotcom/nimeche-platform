import { readFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";

import { db } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { renderCertificateHtml } from "./template";

/**
 * Renders a credential to PDF and stores it. A certificate is generated once,
 * on first download, and every later download serves the stored copy — a
 * document re-rendered years later must not change a pixel.
 *
 * Chromium: @sparticuz/chromium on Vercel's serverless runtime; a locally
 * installed Chrome or Edge in development, since the sparticuz binary is
 * Linux-only.
 */
export async function generatePdf(credentialId: string): Promise<string> {
  const credential = await db.credential.findUnique({
    where: { id: credentialId },
    select: {
      code: true,
      title: true,
      sessions: true,
      contactHours: true,
      issuedAt: true,
      member: { select: { fullName: true } },
      skills: { select: { skill: { select: { name: true } } } },
      events: { select: { event: { select: { title: true } } } },
    },
  });
  if (!credential) throw new Error("Certificate not found.");

  const verifyUrl = siteUrl(`/verify/${encodeURIComponent(credential.code)}`);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 240 });

  const crestSvg = await readFile(
    path.join(process.cwd(), "public", "nimeche-logo.svg"),
    "utf8"
  );

  const html = renderCertificateHtml({
    memberName: credential.member.fullName,
    title: credential.title,
    issuedAt: credential.issuedAt,
    sessions: credential.sessions,
    contactHours: credential.contactHours,
    skills: credential.skills.map((s) => s.skill.name),
    events: credential.events.map((e) => e.event.title),
    code: credential.code,
    verifyUrl,
    crestSvg,
    qrDataUrl,
  });

  const pdf = await printPdf(html);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`certificates/${credential.code}.pdf`, pdf, {
      access: "public",
      contentType: "application/pdf",
    });
    await db.credential.update({
      where: { id: credentialId },
      data: { pdfUrl: blob.url },
    });
    return blob.url;
  }

  // Development: write to disk and serve the static file.
  const { mkdir, writeFile } = await import("node:fs/promises");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `certificate-${credential.code}.pdf`;
  await writeFile(path.join(dir, filename), pdf);
  const url = `/uploads/${filename}`;
  await db.credential.update({ where: { id: credentialId }, data: { pdfUrl: url } });
  return url;
}

async function printPdf(html: string): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");

  let executablePath: string | undefined;
  let args: string[] = [];
  try {
    const chromium = (await import("@sparticuz/chromium")).default;
    executablePath = await chromium.executablePath();
    args = chromium.args;
  } catch {
    // Not the serverless runtime — find a browser installed on this machine.
    executablePath = await findLocalBrowser();
  }

  const browser = await puppeteer.launch({
    executablePath,
    args: [...args, "--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    // The webfonts load asynchronously after "load" — a certificate printed
    // with fallback fonts is not the same document. Fonts live on Google's
    // CDN; if they never arrive we still print, just with system faces.
    await page
      .evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]))
      .catch(() => undefined);
    return Buffer.from(
      await page.pdf({
        width: "297mm",
        height: "210mm",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      })
    );
  } finally {
    await browser.close();
  }
}

/** Common Chrome/Edge install paths, checked in order. */
async function findLocalBrowser(): Promise<string> {
  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];

  for (const candidate of candidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Try the next one.
    }
  }
  throw new Error(
    "No browser found to print certificates. Install Chrome or Edge, or set one up on the server."
  );
}
