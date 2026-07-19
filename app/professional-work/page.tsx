import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "../site-header";

const selections = [
  {
    index: "01",
    title: "Product programs",
    description: "Physical products, system thinking, and production-minded detail.",
  },
  {
    index: "02",
    title: "Spatial + furniture",
    description: "Workplace, furniture, and environment-led concepts.",
  },
  {
    index: "03",
    title: "Connected experiences",
    description: "Hardware, interface, and service logic designed as one experience.",
  },
] as const;

export default function ProfessionalWorkPage() {
  return (
    <main className="professional-page">
      <SiteHeader variant="index" title="Professional Work" active="professional" />
      <section className="professional-access" aria-labelledby="professional-title" id="main-content">
        <div className="professional-access-intro">
          <span className="professional-eyebrow">Professional work · Shared by request</span>
          <h1 id="professional-title">Selected client work, shared thoughtfully.</h1>
          <p>
            Some projects are confidential. I share a short, role-relevant selection directly
            with teams, collaborators, and clients.
          </p>
        </div>

        <ol className="professional-selection-list" aria-label="Private portfolio areas">
          {selections.map((selection) => (
            <li key={selection.index}>
              <span>{selection.index}</span>
              <div>
                <h2>{selection.title}</h2>
                <p>{selection.description}</p>
              </div>
              <small>Private selection</small>
            </li>
          ))}
        </ol>

        <div className="professional-access-action">
          <p>Tell me what you are looking for and I’ll send the most useful version.</p>
          <a href="mailto:alex@infield.net?subject=Professional%20portfolio%20request">
            Request the private portfolio
            <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
