import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { DOCS, VERSION } from "./partnerDocs";
import { DOCS_ES, ES_NOTICE } from "./partnerDocs.es";
import { LEGAL_ENTITY } from "./site";

// A signed copy of the Authorized Sales Partner documents, as a PDF the partner keeps.
export async function signedPdf(s: { legalName: string; email: string; signedAt: string; ip: string; hash: string; company?: string; title?: string; lang?: "en" | "es"; translationHash?: string }): Promise<string> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("DSP Connect Authorized Sales Partner Agreement");
  pdf.setAuthor(LEGAL_ENTITY);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 56, maxW = W - M * 2;
  let page = pdf.addPage([W, H]);
  let y = H - M;
  // The standard PDF fonts cover Western European letters (so Spanish accents, ñ, ¿ and ¡ print), but not typographic
  // quotes and dashes, which are simplified.
  const clean = (t: string) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

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

  line("DSP Connect - Authorized Sales Partner Agreement", bold, 15, 6);
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
  if (s.company) line(`Sales Partner: ${s.company} (a company)`, bold);
  line(`Signed electronically by: ${s.legalName}${s.company ? `, ${s.title || "authorized signer"}, for and on behalf of ${s.company}` : ""}`);
  line(`Email: ${s.email}`);
  line(`Signed at: ${s.signedAt} (UTC)`);
  line(`IP address: ${s.ip || "not recorded"}`);
  line(`Document fingerprint (SHA-256): ${s.hash}`, font, 8);
  line("The signer read each document above, ticked to accept each one, and typed their full legal name to sign. Where a company is named, the signer confirmed they are authorized to bind it.", font, 9, 4, rgb(0.36, 0.4, 0.47));
  if (s.lang === "es") {
    // The partner read the documents in Spanish. The English text above is what was signed and controls; the
    // Spanish translation follows for reference, with its own fingerprint.
    line("The signer read these documents in the Spanish translation that follows, and confirmed that the English version controls.", font, 9, 4, rgb(0.36, 0.4, 0.47));
    page = pdf.addPage([W, H]); y = H - M;
    line("Traducción al español (solo para referencia)", bold, 15, 6);
    line(ES_NOTICE, font, 9, 10, rgb(0.36, 0.4, 0.47));
    for (const d of DOCS_ES) {
      space(8);
      line(`${d.tag}: ${d.title}`, bold, 12, 8);
      for (const sec of d.sections) {
        if (sec.h) { space(4); line(sec.h, bold, 10, 4); }
        for (const p of sec.p) { if (p === ES_NOTICE) continue; line(p); space(4); }
      }
    }
    space(12);
    line(`Firmado electrónicamente por: ${s.legalName}${s.company ? `, ${s.title || "firmante autorizado"}, en nombre de ${s.company}` : ""}, el ${s.signedAt} (UTC).`);
    if (s.translationHash) line(`Huella de esta traducción (SHA-256): ${s.translationHash}`, font, 8);
  }
  return Buffer.from(await pdf.save()).toString("base64");
}
