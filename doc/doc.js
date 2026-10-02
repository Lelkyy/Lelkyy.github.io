/* The in-page reader for the PDFs in the index - the papers, the poster, the
 * CanSat report, the Yavalath documentation.
 *
 * Before this, a PDF link carried `download`, so clicking "the paper" wrote a
 * file to disk and left you looking at the same page. Now the link points
 * here, the document renders inside the site, and saving a copy is a choice
 * rather than the only behaviour.
 *
 * The viewer is the browser's own: an <object type="application/pdf"> needs no
 * library, no worker and no build step, which is the same bargain the rest of
 * the site makes. Where that is refused - most phones - the fallback inside
 * the <object> offers the file in its own tab instead.
 */

(function () {
  const params = new URLSearchParams(location.search);

  /* `f` arrives in a URL anyone can craft, so it is checked rather than
     trusted: a relative path, under Documentation, ending in .pdf, and no
     traversal. That rules out a scheme, a protocol-relative host and a walk
     up out of the folder - this page will only ever frame our own papers. */
  function safeDoc(value) {
    if (!value) return null;
    let path;
    try {
      path = decodeURIComponent(value);
    } catch (e) {
      return null;
    }
    /* Links have been written both with and without the leading slash, so
       accept either and store it without. */
    path = path.replace(/^\//, "");
    if (path.indexOf("..") !== -1) return null;
    if (!/^Documentation\/[^/\\]+\.pdf$/i.test(path)) return null;
    return path;
  }

  /* "/Investigating_neural_scaling_laws (9).pdf" is a filename, not a title.
     Strip the folder, the extension and the copy-number the download left
     behind, then let underscores read as spaces. */
  function titleFromPath(path) {
    return path
      .replace(/^Documentation\//i, "")
      .replace(/\.pdf$/i, "")
      .replace(/\s*\(\d+\)\s*$/, "")
      .replace(/_/g, " ")
      .trim();
  }

  const path = safeDoc(params.get("f"));
  const titleEl = document.getElementById("doc-title");
  const frame = document.querySelector(".doc-frame");

  if (!path) {
    /* No document, or one we will not frame. Say so in the page rather than
       leaving an empty grey box. */
    document.title = "Document not found · Leonid Elkin";
    titleEl.textContent = "Not found";
    if (frame) {
      frame.innerHTML = "";
      const box = document.createElement("div");
      box.className = "doc-fallback";
      const p = document.createElement("p");
      p.textContent = "There is no document at that address.";
      const back = document.createElement("p");
      const a = document.createElement("a");
      a.className = "btn";
      a.href = "/projects/";
      a.textContent = "See all work";
      back.appendChild(a);
      box.append(p, back);
      frame.appendChild(box);
    }
    const actions = document.querySelector(".page-head .actions");
    if (actions) actions.hidden = true;
    return;
  }

  const label = params.get("t") ? params.get("t") : titleFromPath(path);

  document.title = label + " · Leonid Elkin";
  titleEl.textContent = label;

  /* The filenames carry spaces and brackets - "/Physics_investigation (2).pdf"
     - so the path is encoded before it becomes a URL. */
  const href = "/" + encodeURI(path);

  /* #view=FitH fits the page to the frame's width, which is what you want
     when the frame is narrower than the paper it is showing. */
  const obj = document.getElementById("doc-object");
  obj.setAttribute("data", href + "#view=FitH");
  obj.setAttribute("aria-label", label + ", PDF");

  ["doc-open", "doc-open-fallback", "doc-download"].forEach(function (id) {
    const a = document.getElementById(id);
    if (a) a.href = href;
  });

  /* Save it under its title rather than whatever the file happens to be
     called in the repo. */
  const save = document.getElementById("doc-download");
  if (save) {
    save.setAttribute("download",
      label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".pdf");
  }

  /* Back to wherever you came from, when that was us. A referrer from
     anywhere else is ignored and the index stands in. */
  const back = document.getElementById("doc-back");
  if (back && document.referrer) {
    try {
      const from = new URL(document.referrer);
      if (from.origin === location.origin && !/^\/doc\//.test(from.pathname)) {
        back.href = from.href;
        if (/^\/case\//.test(from.pathname)) back.textContent = "← Back to the project";
        else if (/^\/about\//.test(from.pathname)) back.textContent = "← Back to About";
      }
    } catch (e) {
      /* leave the default */
    }
  }
})();
