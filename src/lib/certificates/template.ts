import { longDate } from "@/lib/format";

/**
 * The certificate document, as one standalone HTML string.
 *
 * This is the single template for screen, PDF and print (design plan §14):
 * light theme always, inline styles only — puppeteer renders it without any
 * stylesheet loading. Layout skeleton, crest placement and the verification
 * block are locked; only the title text is ever variable.
 *
 * Colours are the light-theme values from docs/design/tokens.css, hard-coded
 * because a certificate must look identical regardless of what changes in the
 * token file.
 */
export type CertificateData = {
  memberName: string;
  title: string;
  issuedAt: Date;
  sessions: number;
  contactHours: number;
  skills: string[];
  events: string[];
  code: string;
  verifyUrl: string;
  crestSvg: string;
  qrDataUrl: string;
};

/** A4 landscape at 96dpi. Puppeteer prints at exactly this size. */
const PAGE = { width: "297mm", height: "210mm" };

export function renderCertificateHtml(data: CertificateData): string {
  const details: string[] = [];
  if (data.sessions > 1) details.push(`${data.sessions} sessions`);
  if (data.contactHours > 0) details.push(`${data.contactHours} contact hours`);
  if (data.events.length > 0) details.push(data.events.join(", "));

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Certificate — ${escapeHtml(data.memberName)} — ${escapeHtml(data.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${PAGE.width}; height: ${PAGE.height};
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: #12261A; background: #FFFFFF;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .sheet { position: relative; width: 100%; height: 100%; padding: 56px 64px 48px 88px; }
  /* The 6px orange gear-rule, full bleed down the left edge. */
  .rule { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #EE7623; }
  .crest { position: absolute; top: 48px; right: 64px; width: 96px; height: 84px; }
  .crest svg { width: 100%; height: 100%; }
  .overline {
    font-family: 'Sora', system-ui, sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; color: #00713A; margin-top: 8px;
  }
  h1 {
    font-family: 'Sora', system-ui, sans-serif; font-weight: 700;
    font-size: 44px; line-height: 1.15; margin-top: 26px;
  }
  .name-rule { width: 220px; height: 2px; background: #12261A; margin-top: 14px; }
  .completes { font-size: 16px; color: #56655C; margin-top: 22px; }
  .programme {
    font-family: 'Sora', system-ui, sans-serif; font-weight: 600;
    font-size: 27px; line-height: 1.25; margin-top: 8px; max-width: 640px;
  }
  .programme-sub { font-size: 14px; color: #56655C; margin-top: 8px; }
  .detail { font-size: 14px; color: #56655C; margin-top: 18px; max-width: 640px; }
  .skills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; max-width: 620px; }
  .skill {
    font-size: 12px; font-weight: 600; color: #00713A;
    background: #E8F7EE; border-radius: 999px; padding: 5px 12px;
  }
  .foot { position: absolute; left: 88px; right: 64px; bottom: 44px; display: flex; align-items: flex-end; justify-content: space-between; }
  .signatures { display: flex; gap: 72px; }
  .sig { text-align: center; }
  .sig .line { width: 170px; border-bottom: 1.5px solid #75857B; height: 34px; }
  .sig .who { font-size: 12.5px; font-weight: 600; margin-top: 7px; }
  .sig .office { font-size: 11.5px; color: #56655C; margin-top: 1px; }
  .issued { font-size: 13px; color: #56655C; }
  .verify { display: flex; align-items: center; gap: 16px; }
  .verify img { width: 92px; height: 92px; display: block; }
  .verify .code {
    font-family: ui-monospace, 'Cascadia Mono', 'Courier New', monospace;
    font-size: 19px; font-weight: 600; letter-spacing: 0.06em;
  }
  .verify .url { font-size: 12px; color: #56655C; margin-top: 4px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="rule"></div>
    <div class="crest">${data.crestSvg}</div>

    <p class="overline">Certificate of completion</p>
    <h1>${escapeHtml(data.memberName)}</h1>
    <div class="name-rule"></div>
    <p class="completes">has completed</p>
    <p class="programme">${escapeHtml(data.title)}</p>
    <p class="programme-sub">a NiMechE-SF professional development programme, Tech-U branch</p>
    ${details.length ? `<p class="detail">${escapeHtml(details.join(" · "))}</p>` : ""}
    ${
      data.skills.length
        ? `<div class="skills">${data.skills
            .map((s) => `<span class="skill">${escapeHtml(s)}</span>`)
            .join("")}</div>`
        : ""
    }

    <div class="foot">
      <div class="signatures">
        <div class="sig"><div class="line"></div><div class="who">President</div><div class="office">NiMechE-SF, Tech-U</div></div>
        <div class="sig"><div class="line"></div><div class="who">Programmes Secretary</div><div class="office">NiMechE-SF, Tech-U</div></div>
      </div>
      <div class="verify">
        <img src="${data.qrDataUrl}" alt="QR code linking to the verification page for this certificate">
        <div>
          <div class="code">${escapeHtml(data.code)}</div>
          <div class="url">Verify at ${escapeHtml(data.verifyUrl.replace(/^https?:\/\//, ""))}</div>
          <div class="url">Issued ${escapeHtml(longDate(data.issuedAt))}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
