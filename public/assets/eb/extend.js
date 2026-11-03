/* Extend blur runtime (Alex approved, Nov 2). Marks each framed image or poster as waiting over its
   colour field, fades it in once decoded, and lets the field drift only while it waits on screen. */
(function () {
  var d = document.documentElement;
  // On screen (with a 120 px margin) from the box itself: WebKit reports Home's cards, which sit
  // inside a link, as never intersecting, so isIntersecting alone would never start their drift.
  function near(r) { return r.width > 0 && r.bottom > -120 && r.top < innerHeight + 120; }
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.toggleAttribute("data-eb-vis", e.isIntersecting || near(e.boundingClientRect)); });
  }, {rootMargin: "120px", threshold: [0, 0.01, 0.5, 1]}) : null;

  function setup(m) {
    if (m.__eb) return; m.__eb = 1;
    var h = m.parentElement;
    if (!h || !h.hasAttribute("data-eb-host")) return;
    if (getComputedStyle(h).display === "contents") { h.removeAttribute("data-eb-host"); return; }  // no box: no field
    var finished = false;
    function fin() {
      if (finished) return; finished = true;
      if (h.getAttribute("data-eb") !== "wait") { h.setAttribute("data-eb", "done"); return; }
      // hand the drifting field's current transform over, then let it ease back to rest
      var t = getComputedStyle(h, "::before").transform;
      h.style.setProperty("--eb-t", t && t !== "none" ? t : "none");
      h.setAttribute("data-eb", "in");
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.style.setProperty("--eb-t", "none"); }); });
      setTimeout(function () {
        h.setAttribute("data-eb", "done");
        if (io) io.unobserve(h);
        h.removeAttribute("data-eb-vis");
        h.style.removeProperty("--eb-t");
      }, 520);
    }
    if (m.tagName === "IMG") {
      if (m.complete && m.naturalWidth > 0 && m.getAttribute("src") !== null) { finished = true; h.setAttribute("data-eb", "done"); return; }
      h.setAttribute("data-eb", "wait");
      m.addEventListener("load", fin); m.addEventListener("error", fin);
    } else {                                   // video: its poster is what loads
      h.setAttribute("data-eb", "wait");
      var p = m.getAttribute("poster");
      if (!p) { fin(); return; }
      var i = new Image(); i.onload = i.onerror = fin; i.src = p;
      if (i.complete && i.naturalWidth) { finished = true; h.setAttribute("data-eb", "done"); return; }
    }
    if (!finished) { if (near(h.getBoundingClientRect())) h.setAttribute("data-eb-vis", ""); if (io) io.observe(h); }
    setTimeout(fin, 15000);   // never leave media hidden
  }
  document.querySelectorAll("[data-eb-media]").forEach(setup);
  d.setAttribute("data-eb-live", "");
})();
