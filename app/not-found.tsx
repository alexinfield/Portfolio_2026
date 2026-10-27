/* eslint-disable @next/next/no-html-link-for-pages -- static Pages export requires native navigation */
import LiveHeader from "./live-header";

export default function NotFound() {
  return (
    <main className="home-body">
      <LiveHeader />
      <div id="main-content" tabIndex={-1} className="not-found-content">
        <h1>Page not found</h1>
        <p>404</p>
        <a href="/">Work</a>
        <a href="mailto:alex@infield.net">Contact</a>
      </div>
    </main>
  );
}
