import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { DOCS, VERSION } from "./partnerDocs";
import { LEGAL_ENTITY } from "./site";

// A signed copy of the admission documents, as a PDF the partner keeps.
export async function signedPdf(s: { legalName: string; email: string; signedAt: string; ip: string; hash: string }): Promise<string> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("DSP Connect Managing Partner admission documents");
  pdf.setAuthor(LEGAL_ENTITY);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 56, maxW = W - M * 2;
  let page = pdf.addPage([W, H]);
  let y = H - M;
  // The standard PDF fonts only cover basic Latin, so typographic quotes and dashes are simplified.
  const clean = (t: string) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7E]/g, "");

  const line = (text: string, f = font, size = 10, gap = 4, color = rgb(0.04, 0.07, 0.13)) => {
    const words = clean(text).split(/\s+/);
    let cur = "";
    const flush = () => {
      if (y < M + size) { page = pdf.addPage([W, H]); y = H - M; }
      page.drawText(cur, { x: M, y, size, font: f, color });
      y -= size + gap;
      cur = "";
    };
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(next, size) > maxW && cur) { flush(); cur = w; } else cur = next;
    }
    if (cur) flush();
  };
  const space = (n: number) => { y -= n; };

  line("DSP Connect - Managing Partner admission documents", bold, 15, 6);
  line(`Version ${VERSION}. A service of ${LEGAL_ENTITY}.`, font, 9, 14, rgb(0.36, 0.4, 0.47));
  for (const d of DOCS) {
    space(8);
    line(`${d.tag}: ${d.title}`, bold, 12, 8);
    for (const s of d.sections) {
      if (s.h) { space(4); line(s.h, bold, 10, 4); }
      for (const p of s.p) { line(p); space(4); }
    }
  }
  space(16);
  line("Signature", bold, 12, 8);
  line(`Signed electronically by: ${s.legalName}`);
  line(`Email: ${s.email}`);
  line(`Signed at: ${s.signedAt} (UTC)`);
  line(`IP address: ${s.ip || "not recorded"}`);
  line(`Document fingerprint (SHA-256): ${s.hash}`, font, 8);
  line("The signer read each document above, ticked to accept each one, and typed their full legal name to sign.", font, 9, 4, rgb(0.36, 0.4, 0.47));
  return Buffer.from(await pdf.save()).toString("base64");
}
