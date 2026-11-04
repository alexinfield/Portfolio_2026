import panels from "@/lib/case-panels.json";

// The audit follow-up enables the existing panel transcripts without changing
// the approved image-led presentation.
export const CASE_TEXT_ENABLED = true;

type Panel = {
  alt: string;
  title?: string;
  displayTitle?: string;
  heading?: string;
  roles?: string[];
  type?: string[];
  date?: string;
  blocks?: { heading?: string; text?: string; list?: string[] }[];
};

export function casePanel(source: string): Panel | undefined {
  return (panels as Record<string, Panel>)[source];
}

// Keep the approved boards intact while exposing their authored text and
// heading structure to assistive technology at every viewport size.
export default function CaseText({ source }: { source: string }) {
  if (!CASE_TEXT_ENABLED) return null;
  const panel = casePanel(source);
  if (!panel || !(panel.title || panel.heading || panel.blocks?.length)) return null;

  return (
    <section className="case-text" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}>
      {panel.title ? <h2>{panel.displayTitle ?? panel.title}</h2> : null}
      {panel.displayTitle ? <p>{panel.title}</p> : null}
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
