import { Footer, Header } from "@/components/Chrome";
import { LEGAL_ENTITY, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/site";

export type Part = [heading: string, paragraphs: string[]];

/** One layout for the terms, privacy and refund pages, so they read the same way. */
export default function Legal({ title, intro, parts }: { title: string; intro: string; parts: Part[] }) {
  return (
    <>
      <Header />
      <main className="wrap stack g32" style={{ maxWidth: 800, padding: "64px 32px 80px" }}>
        <div className="stack g12">
          <h1 className="h1" style={{ fontSize: "clamp(30px,4vw,40px)" }}>{title}</h1>
          <p className="small">Last updated {LEGAL_UPDATED}</p>
          <p className="lead">{intro}</p>
        </div>
        {parts.map(([h, ps], i) => (
          <section className="stack g12" key={h}>
            <h2 className="h3" style={{ fontSize: 19 }}>{i + 1}. {h}</h2>
            {ps.map((p) => <p className="p" key={p.slice(0, 40)}>{p}</p>)}
          </section>
        ))}
        <section className="stack g12">
          <h2 className="h3" style={{ fontSize: 19 }}>{parts.length + 1}. How to reach us</h2>
          <p className="p">
            DSP Connect is a service of {LEGAL_ENTITY}. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
