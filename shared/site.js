/* Rendering for the pages that draw on shared/data.js: the home page's
 * selected work, the work index and its filter, each project's page, and the
 * lists on the about page. Every page also gets the copy-email button.
 *
 * Nothing here is needed to read a page that has its words in the HTML;
 * it only fills the parts that come from the one list of projects.
 */

(function () {
  "use strict";

  const S = window.SITE;

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  const isExternal = (url) => /^https?:\/\//i.test(url);

  const STATUS = { live: "Live", wip: "In progress" };

  function catLabel(cat) {
    const hit = S && S.CATS.find((c) => c[0] === cat);
    return hit ? hit[1] : "";
  }

  function pageFor(p) {
    return p.page || "/case/?p=" + p.slug;
  }

  /* Where a link really goes. A PDF opens in the site's own reader with a
     readable title; any other file in the repo is offered as a download. */
  function resolve(link) {
    const url = link.url;
    if (isExternal(url)) return { href: url, external: true };
    const path = url.split(/[?#]/)[0];
    if (/\.pdf$/i.test(path)) {
      let href = "/doc/?f=" + encodeURIComponent(path.replace(/^\//, ""));
      if (link.title) href += "&t=" + encodeURIComponent(link.title);
      return { href: href };
    }
    if (path && !/\/$/.test(path) && !/\.html?$/i.test(path)) return { href: url, download: true };
    return { href: url };
  }

  function linkTo(link, cls) {
    const a = el("a", cls, link.label);
    const r = resolve(link);
    a.href = r.href;
    if (r.external) {
      a.target = "_blank";
      a.rel = "noopener";
      a.classList.add("ext");
    }
    if (r.download) a.setAttribute("download", "");
    return a;
  }

  function statusEl(p) {
    return p.status ? el("span", "status " + p.status, STATUS[p.status]) : null;
  }

  function tagList(tags) {
    const ul = el("ul", "tags");
    (tags || []).forEach((t) => ul.appendChild(el("li", null, t)));
    return ul;
  }

  function thumb(p) {
    const box = el("div", "thumb");
    if (p.image) {
      if (p.image.fit) box.classList.add(p.image.fit);
      const img = el("img");
      img.src = p.image.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      box.appendChild(img);
    }
    return box;
  }

  /* ---------- a card and a row ---------- */

  function card(p) {
    const li = el("li", "project");
    li.dataset.cat = p.cat;
    li.appendChild(thumb(p));

    const body = el("div", "card-body");
    const top = el("div", "card-top");
    top.appendChild(el("span", "label", catLabel(p.cat)));
    const st = statusEl(p);
    if (st) top.appendChild(st);
    body.appendChild(top);

    const h = el("h3");
    const a = el("a", null, p.title);
    a.href = pageFor(p);
    h.appendChild(a);
    body.appendChild(h);
    body.appendChild(el("p", null, p.blurb));
    body.appendChild(tagList(p.tags));

    li.appendChild(body);
    return li;
  }

  function row(p) {
    const li = el("li", "row");
    li.dataset.cat = p.cat;
    const h = el("h3");
    const a = el("a", null, p.title);
    a.href = pageFor(p);
    h.appendChild(a);
    li.appendChild(h);
    li.appendChild(el("p", null, p.blurb));
    li.appendChild(tagList(p.tags));
    return li;
  }

  /* ---------- counts quoted in the copy ---------- */

  function initCounts() {
    if (!S) return;
    document.querySelectorAll("[data-count]").forEach((n) => {
      n.textContent = String(S.projects.length);
    });
  }

  /* ---------- home ---------- */

  function initFeatured() {
    const root = document.getElementById("featured");
    if (!root || !S) return;
    S.FEATURED.forEach((slug) => {
      const p = S.projects.find((q) => q.slug === slug);
      if (p) root.appendChild(card(p));
    });
  }

  /* ---------- work index ---------- */

  function initWork() {
    const cards = document.getElementById("work-cards");
    const rows = document.getElementById("work-rows");
    if (!cards || !S) return;

    S.projects.forEach((p) => {
      if (p.tier === 2) rows.appendChild(row(p));
      else cards.appendChild(card(p));
    });

    const filters = document.getElementById("filters");
    const subhead = document.getElementById("smaller-head");
    const all = [...cards.children, ...rows.children];

    const counts = { all: all.length };
    all.forEach((n) => (counts[n.dataset.cat] = (counts[n.dataset.cat] || 0) + 1));

    const options = [["all", "All"]].concat(S.CATS.filter((c) => counts[c[0]]));
    const buttons = options.map(([key, label]) => {
      const b = el("button", "chip");
      b.type = "button";
      b.dataset.filter = key;
      b.append(label + " ");
      b.appendChild(el("span", "n", String(counts[key])));
      b.addEventListener("click", () => apply(key, true));
      filters.appendChild(b);
      return b;
    });

    function apply(key, push) {
      if (!counts[key]) key = "all";
      all.forEach((n) => (n.hidden = !(key === "all" || n.dataset.cat === key)));
      subhead.hidden = ![...rows.children].some((n) => !n.hidden);
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === key)));
      if (push) history.replaceState(null, "", key === "all" ? location.pathname : "#" + key);
    }

    apply((location.hash || "").slice(1) || "all", false);
    window.addEventListener("hashchange", () => apply(location.hash.slice(1) || "all", false));
  }

  /* ---------- a project's own page ---------- */

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function mountDurak(root) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/shared/durak.css?v=3";
    document.head.appendChild(css);

    const h = el("h2", null, "Play the computer");
    const p = el("p", null, "Click a card in your hand to play it. The two buttons under the table take the cards or end your turn. ");
    const online = el("a", null, "Play a friend online instead.");
    online.href = "/durak-online/";
    p.appendChild(online);
    const board = el("div", "durak");
    board.id = "durak";
    const wrap = el("div", "durak-wrap");
    wrap.appendChild(board);
    root.append(h, p, wrap);

    loadScript("/shared/durak-sfx.js").then(() => loadScript("/shared/durak.js"));
  }

  function initCase() {
    const root = document.getElementById("case");
    if (!root || !S) return;

    const slug = new URLSearchParams(location.search).get("p") || "";
    const i = S.projects.findIndex((q) => q.slug === slug);
    const p = S.projects[i];
    const title = document.getElementById("case-title");

    if (!p) {
      document.title = "Project not found · Leonid Elkin";
      title.textContent = "Project not found";
      document.getElementById("case-lede").textContent =
        "There's no project at this address. It may have been renamed or taken off the site.";
      const actions = document.getElementById("case-actions");
      const a = el("a", "btn primary", "See all work");
      a.href = "/projects/";
      actions.appendChild(a);
      return;
    }

    document.title = p.title + " · Leonid Elkin";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = p.summary;

    const eyebrow = document.getElementById("case-eyebrow");
    eyebrow.appendChild(el("span", "label", catLabel(p.cat)));
    const st = statusEl(p);
    if (st) eyebrow.appendChild(st);

    title.textContent = p.title;
    document.getElementById("case-lede").textContent = p.summary;

    const actions = document.getElementById("case-actions");
    (p.links || []).forEach((l, k) => actions.appendChild(linkTo(l, k === 0 ? "btn primary" : "btn")));
    if (!actions.children.length) actions.remove();

    if (p.image) {
      const fig = document.getElementById("case-figure");
      const img = document.getElementById("case-img");
      img.src = p.image.src;
      img.alt = p.image.alt || "";
      if (p.image.fit === "contain") fig.classList.add("contain");
      const cap = document.getElementById("case-cap");
      if (p.image.caption) cap.textContent = p.image.caption;
      else cap.remove();
      fig.hidden = false;
    }

    const prose = document.getElementById("case-prose");
    (p.sections || []).forEach(([head, body]) => {
      prose.appendChild(el("h2", null, head));
      prose.appendChild(el("p", null, body));
    });

    if (p.demo === "durak") mountDurak(prose);
    if (p.demo === "movegrade") {
      loadScript("/case/movegrade-demo.js?v=5").then(() => {
        if (window.mountMoveGradeDemo) window.mountMoveGradeDemo(prose);
      });
    }

    const facts = document.getElementById("case-facts");
    const fact = (k, v) => {
      const d = el("div");
      d.appendChild(el("dt", null, k));
      const dd = el("dd");
      if (typeof v === "string") dd.textContent = v;
      else dd.appendChild(v);
      d.appendChild(dd);
      facts.appendChild(d);
    };
    if (p.status) fact("Status", STATUS[p.status]);
    (p.facts || []).forEach(([k, v]) => fact(k, v));
    if (!facts.children.length) facts.remove();

    if (!prose.children.length && !facts.parentNode) {
      document.getElementById("case-body").remove();
    }

    const prev = S.projects[i - 1];
    const next = S.projects[i + 1];
    const pager = document.getElementById("case-pager");
    [[prev, "Previous"], [next, "Next"]].forEach(([q, word]) => {
      if (!q) return;
      const a = el("a");
      a.href = pageFor(q);
      a.appendChild(el("span", "label", word));
      a.appendChild(el("span", "t", q.title));
      pager.appendChild(a);
    });
  }

  /* ---------- about ---------- */

  function timelineItem(when, title, org, points, more) {
    const li = el("li");
    li.appendChild(el("span", "when", when));
    const box = el("div");
    box.appendChild(el("h3", null, title));
    if (org) box.appendChild(el("p", "org", org));
    if (points && points.length) {
      const ul = el("ul");
      points.forEach((t) => ul.appendChild(el("li", null, t)));
      box.appendChild(ul);
    }
    if (more) {
      const links = el("p", "links");
      links.appendChild(more);
      box.appendChild(links);
    }
    li.appendChild(box);
    return li;
  }

  function initAbout() {
    if (!S) return;
    const edu = document.getElementById("education-list");
    if (edu) {
      S.education.forEach((e) => edu.appendChild(timelineItem(e.when, e.org, e.title)));
    }

    const res = document.getElementById("research-list");
    if (res) {
      S.research.forEach((r) => {
        const a = el("a", "text-link", "Read about it");
        a.href = "/case/?p=" + r.slug;
        res.appendChild(timelineItem(r.when, r.title, r.org, r.points, a));
      });
    }

    const sk = document.getElementById("skills");
    if (sk) {
      S.skills.forEach((group) => {
        const col = el("div");
        col.appendChild(el("h3", "label", group.head));
        const ul = el("ul");
        group.items.forEach(([name, via]) => {
          const li = el("li");
          li.appendChild(el("span", "name", name));
          if (via) li.appendChild(el("span", "via", via));
          ul.appendChild(li);
        });
        col.appendChild(ul);
        sk.appendChild(col);
      });
    }
  }

  /* ---------- copy the email address ---------- */

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((b) => {
      b.addEventListener("click", async () => {
        const text = b.dataset.copy;
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (e) {
          /* no clipboard access: select the address so a copy is one keystroke */
          const a = b.parentNode.querySelector(".email");
          if (a) {
            const range = document.createRange();
            range.selectNodeContents(a);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        const was = b.textContent;
        b.textContent = ok ? "Copied" : "Selected";
        setTimeout(() => (b.textContent = was), 1800);
      });
    });
  }

  function start() {
    initCounts();
    initFeatured();
    initWork();
    initCase();
    initAbout();
    initCopy();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
