import panels from "@/lib/case-panels.json";

type Panel = {
  alt: string;
  title?: string;
  heading?: string;
  roles?: string[];
  type?: string[];
  date?: string;
  blocks?: { heading?: string; text?: string; list?: string[] }[];
};

export function casePanel(source: string): Panel | undefined {
  return (panels as Record<string, Panel>)[source];
}

// The original desktop boards remain intact. Their text equivalents are readable
// on small screens and stay in the accessibility tree at every viewport size.
export default function CaseText({ source }: { source: string }) {
  const panel = casePanel(source);
  if (!panel || !(panel.title || panel.heading || panel.blocks?.length)) return null;

  return (
    <section className="case-text" aria-label="Panel text">
      {panel.title ? <h1>{panel.title}</h1> : null}
      {panel.heading ? <h2>{panel.heading}</h2> : null}
      {panel.blocks?.map((block, index) => (
        <div key={index}>
          {block.heading ? <h3>{block.heading}</h3> : null}
          {block.text ? <p>{block.text}</p> : null}
          {block.list ? <ul>{block.list.map((text) => <li key={text}>{text}</li>)}</ul> : null}
        </div>
      ))}
      {panel.roles || panel.type || panel.date ? (
        <dl>
          {panel.roles ? <><dt>Role</dt><dd>{panel.roles.join(" · ")}</dd></> : null}
          {panel.type ? <><dt>Type</dt><dd>{panel.type.join(" · ")}</dd></> : null}
          {panel.date ? <><dt>Date</dt><dd>{panel.date}</dd></> : null}
        </dl>
      ) : null}
    </section>
  );
}
