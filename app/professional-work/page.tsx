import { ArrowUpRight, LockSimple } from "@phosphor-icons/react/ssr";
import SiteHeader from "../site-header";

export default function ProfessionalWorkPage() {
  return (
    <main className="professional-page">
      <SiteHeader variant="index" title="Professional Work" active="professional" closeHref="/" />
      <section className="professional-gate" aria-labelledby="professional-title">
        <LockSimple size={24} weight="regular" aria-hidden="true" />
        <div>
          <span>Selected client work</span>
          <h1 id="professional-title">Professional work is available by request.</h1>
        </div>
        <a href="mailto:alex@infield.net?subject=Professional%20portfolio%20access">
          Request access <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
