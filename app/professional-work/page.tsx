import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "../site-header";

export default function ProfessionalWorkPage() {
  return (
    <main className="professional-page">
      <SiteHeader variant="index" title="Professional Work" active="professional" closeHref="/" />
      <section className="professional-access" aria-labelledby="professional-title">
        <div className="professional-access-intro">
          <span>Professional portfolio</span>
          <h1 id="professional-title">Selected collaborations and confidential client work.</h1>
        </div>

        <dl className="professional-access-details">
          <div><dt>Format</dt><dd>Private presentation</dd></div>
          <div><dt>Includes</dt><dd>Product, spatial, and systems work</dd></div>
          <div><dt>Access</dt><dd>Shared directly for relevant opportunities</dd></div>
        </dl>

        <div className="professional-access-action">
          <p>If you are hiring, commissioning, or collaborating, send a quick note and I’ll share the relevant work.</p>
          <a href="mailto:alex@infield.net?subject=Professional%20portfolio%20access">
            Request access <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
