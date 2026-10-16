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

  if (process.platform === "linux") {
    // Serverless (Vercel): the Lambda-compatible Chromium launches and stays
    // attached, so puppeteer's own handshake works.
    const chromium = (await import("@sparticuz/chromium")).default;
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
    try {
      return await printViaPage(browser, html);
    } finally {
      await browser.close();
    }
  }

  // Windows/macOS development: Edge and Chrome's launcher stub exits
  // immediately when spawned with pipes, which breaks puppeteer's launch
  // handshake (the browser itself runs on fine as a detached process). Spawn
  // detached and drive the browser over the DevTools protocol instead.
  const executablePath = await findLocalBrowser();
  const port = 30000 + Math.floor(Math.random() * 20000);
  const os = await import("node:os");
  const { mkdtemp } = await import("node:fs/promises");
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "nimeche-cert-"));

  const { spawn } = await import("node:child_process");
  const child = spawn(
    executablePath,
    [
      "--headless",
      "--no-first-run",
      "--disable-gpu",
      "--no-sandbox",
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${port}`,
      "about:blank",
    ],
    { detached: true, stdio: "ignore" }
  );
  child.unref();

  // The DevTools server takes a moment; poll rather than assume.
  let up = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        up = true;
        break;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!up) {
    throw new Error("Started the browser but could not reach it to print. Try again.");
  }

  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });
  try {
    return await printViaPage(browser, html);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

type BrowserLike = Awaited<ReturnType<typeof import("puppeteer-core").connect>>;

async function printViaPage(
  browser: BrowserLike,
  html: string
): Promise<Buffer> {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
  // The webfonts load asynchronously after "load" — a certificate printed
  // with fallback fonts is not the same document. Fonts live on Google's
  // CDN; if they never arrive we still print, just with system faces.
  await page
    .evaluate(() =>
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])
    )
    .catch(() => undefined);
  return Buffer.from(
    await page.pdf({
      width: "297mm",
      height: "210mm",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
  );
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
