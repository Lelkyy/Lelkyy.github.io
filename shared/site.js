/* Everything on the site that comes from shared/data.js: the index of work
 * and the viewer beside it, each project's page, the Papers tab, the Live
 * tab's panels, and the lists on the about page. Every page also gets the
 * mobile menu and the copy-email button.
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

  const pad = (n) => String(n).padStart(2, "0");
  const isExternal = (url) => /^https?:\/\//i.test(url);
  const STATUS = { live: "Live", wip: "In progress" };

  function catLabel(cat) {
    const hit = S && S.CATS.find((c) => c[0] === cat);
    return hit ? hit[1] : "";
  }

  function pageFor(p) {
    return p.page || "/case/?p=" + p.slug;
  }

  function slugName(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* Where a link really goes. A PDF opens in the site's own reader under a
     readable title; any other file in the repo is offered as a download. */
  function resolve(link) {
    const url = link.url;
    if (isExternal(url)) return { href: url, kind: "ext" };
    const path = url.split(/[?#]/)[0];
    if (/\.pdf$/i.test(path)) {
      let href = "/doc/?f=" + encodeURIComponent(path.replace(/^\//, ""));
      if (link.title) href += "&t=" + encodeURIComponent(link.title);
      return { href: href, kind: "doc" };
    }
    if (path && !/\/$/.test(path) && !/\.html?$/i.test(path)) return { href: url, kind: "file" };
    return { href: url, kind: "page" };
  }

  function goLink(link) {
    const r = resolve(link);
    const a = el("a", "go", link.label);
    a.href = r.href;
    if (r.kind === "ext") {
      a.classList.add("ext");
      a.target = "_blank";
      a.rel = "noopener";
    }
    if (r.kind === "file") {
      a.classList.add("down");
      a.setAttribute("download", "");
    }
    return a;
  }

  function statusEl(p) {
    return p.status ? el("span", "status " + p.status, STATUS[p.status]) : null;
  }

  function loadScript(src) {
    return new Promise((done, fail) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = done;
      s.onerror = fail;
      document.body.appendChild(s);
    });
  }

  /* ---------- the menu, on narrow screens ---------- */

  function initMenu() {
    const btn = document.querySelector(".menu-btn");
    const nav = document.querySelector(".site-nav");
    if (!btn || !nav) return;
    const set = (open) => {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* ---------- the index and its viewer ---------- */

  function indexRow(p, n) {
    const li = el("li", "ix-row" + (p.tier === 2 ? " small" : ""));
    li.dataset.slug = p.slug;
    li.dataset.cat = p.cat;
    const a = el("a");
    a.href = pageFor(p);
    a.appendChild(el("span", "ix-n", pad(n)));
    a.appendChild(el("span", "ix-title display", p.title));
    const side = el("span", "ix-side");
    const st = statusEl(p);
    if (st) side.appendChild(st);
    side.appendChild(el("span", "ix-cat", catLabel(p.cat)));
    a.appendChild(side);
    a.appendChild(el("span", "ix-blurb", p.blurb));
    li.appendChild(a);
    return li;
  }

  /* The viewer: a screen with registration marks, and a readout under it.
     It repeats what the row already links to, so it stays out of the tab
     order and away from screen readers. */
  function monitor(mount, total) {
    mount.className = "monitor";
    mount.setAttribute("aria-hidden", "true");
    mount.innerHTML =
      '<div class="monitor-bar"><span class="label">View <b class="red"></b> / ' + pad(total) + '</span><span class="m-status"></span></div>' +
      '<div class="monitor-screen"><img alt="" decoding="async" /><span class="ticks"></span></div>' +
      '<div class="monitor-read"><p class="label m-kicker"></p><h3 class="display m-title"></h3>' +
      '<p class="m-blurb"></p><p class="m-tags"></p><a class="go" tabindex="-1">Open the project</a></div>';

    const num = mount.querySelector(".monitor-bar b");
    const status = mount.querySelector(".m-status");
    const screen = mount.querySelector(".monitor-screen");
    const img = screen.querySelector("img");
    const kicker = mount.querySelector(".m-kicker");
    const title = mount.querySelector(".m-title");
    const blurb = mount.querySelector(".m-blurb");
    const tags = mount.querySelector(".m-tags");
    const go = mount.querySelector(".go");
    let current = null;

    return function show(p, n) {
      if (current === p) return;
      current = p;
      num.textContent = pad(n);
      status.textContent = "";
      const st = statusEl(p);
      if (st) status.appendChild(st);
      kicker.textContent = catLabel(p.cat) + (p.tags && p.tags[0] ? " / " + p.tags[0] : "");
      title.textContent = p.title;
      blurb.textContent = p.blurb;
      tags.textContent = (p.tags || []).join(" · ");
      go.href = pageFor(p);

      screen.classList.remove("contain", "small");
      if (p.image && p.image.fit) screen.classList.add(p.image.fit);
      const src = p.image ? p.image.src : "";
      if (img.getAttribute("src") === src) return;
      img.classList.add("fading");
      const next = new Image();
      next.onload = next.onerror = () => {
        if (current !== p) return;
        img.src = src;
        img.classList.remove("fading");
      };
      next.src = src;
    };
  }

  function wireIndex(list, mount, items) {
    const rows = Array.from(list.querySelectorAll(".ix-row"));
    const show = mount ? monitor(mount, items.length) : () => {};
    const bySlug = {};
    items.forEach((p, i) => (bySlug[p.slug] = { p, n: i + 1 }));

    function activate(row) {
      rows.forEach((r) => r.classList.toggle("on", r === row));
      const hit = bySlug[row.dataset.slug];
      if (hit) show(hit.p, hit.n);
    }

    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => activate(row));
      row.addEventListener("focusin", () => activate(row));
    });

    /* warm the screenshots once the page has settled */
    const warm = () => items.forEach((p) => { if (p.image) new Image().src = p.image.src; });
    if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 3000 });
    else setTimeout(warm, 1500);

    if (rows[0]) activate(rows[0]);
    return { rows, activate };
  }

  function initFeatured() {
    const list = document.getElementById("featured");
    if (!list || !S) return;
    const items = S.FEATURED.map((slug) => S.projects.find((q) => q.slug === slug)).filter(Boolean);
    items.forEach((p, i) => list.appendChild(indexRow(p, i + 1)));
    wireIndex(list, document.getElementById("featured-monitor"), items);
  }

  function initWork() {
    const list = document.getElementById("work-list");
    if (!list || !S) return;

    const main = S.projects.filter((p) => p.tier !== 2);
    const small = S.projects.filter((p) => p.tier === 2);
    const items = main.concat(small);

    main.forEach((p, i) => list.appendChild(indexRow(p, i + 1)));
    const brk = el("li", "ix-break label", "Smaller projects");
    list.appendChild(brk);
    small.forEach((p, i) => list.appendChild(indexRow(p, main.length + i + 1)));

    const ix = wireIndex(list, document.getElementById("work-monitor"), items);

    const tabs = document.getElementById("filters");
    const counts = { all: items.length };
    items.forEach((p) => (counts[p.cat] = (counts[p.cat] || 0) + 1));
    const options = [["all", "All"]].concat(S.CATS.filter((c) => counts[c[0]]));
    const buttons = options.map(([key, label]) => {
      const b = el("button", "tab");
      b.type = "button";
      b.dataset.filter = key;
      b.append(label + " ");
      b.appendChild(el("span", "n", pad(counts[key])));
      b.addEventListener("click", () => apply(key, true));
      tabs.appendChild(b);
      return b;
    });

    function apply(key, push) {
      if (!counts[key]) key = "all";
      let first = null;
      ix.rows.forEach((r) => {
        const on = key === "all" || r.dataset.cat === key;
        r.hidden = !on;
        if (on && !first) first = r;
      });
      brk.hidden = !ix.rows.some((r) => r.classList.contains("small") && !r.hidden);
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === key)));
      if (first) ix.activate(first);
      if (push) history.replaceState(null, "", key === "all" ? location.pathname : "#" + key);
    }

    apply((location.hash || "").slice(1) || "all", false);
    window.addEventListener("hashchange", () => apply(location.hash.slice(1) || "all", false));
  }

  /* ---------- a project's own page ---------- */

  function initCase() {
    const root = document.getElementById("case");
    if (!root || !S) return;

    const slug = new URLSearchParams(location.search).get("p") || "";

    /* Durak is a game on the site now, not a write-up */
    if (slug === "durak") {
      location.replace("/live/#durak");
      return;
    }

    const i = S.projects.findIndex((q) => q.slug === slug || (q.aliases || []).indexOf(slug) !== -1);
    const p = S.projects[i];
    const title = document.getElementById("case-title");

    if (!p) {
      document.title = "Project not found · Leonid Elkin";
      title.textContent = "Not found";
      document.getElementById("case-lede").textContent =
        "There's no project at this address. It may have been renamed or taken off the site.";
      const gos = document.getElementById("case-actions");
      gos.appendChild(goLink({ label: "See all work", url: "/projects/" }));
      return;
    }

    if (p.slug !== slug) history.replaceState(null, "", "/case/?p=" + p.slug);

    document.title = p.title + " · Leonid Elkin";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = p.summary;

    const eyebrow = document.getElementById("case-eyebrow");
    eyebrow.appendChild(el("span", "label", pad(i + 1) + " / " + catLabel(p.cat)));
    const st = statusEl(p);
    if (st) eyebrow.appendChild(st);

    title.textContent = p.title;
    document.getElementById("case-lede").textContent = p.summary;

    const gos = document.getElementById("case-actions");
    (p.links || []).forEach((l) => gos.appendChild(goLink(l)));
    if (!gos.children.length) gos.remove();

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

    const facts = document.getElementById("case-facts");
    const fact = (k, v) => {
      const d = el("div");
      d.appendChild(el("dt", null, k));
      d.appendChild(el("dd", null, v));
      facts.appendChild(d);
    };
    if (p.status) fact("Status", STATUS[p.status]);
    (p.facts || []).forEach(([k, v]) => fact(k, v));
    if (p.tags && p.tags.length) fact("Tags", p.tags.join(", "));

    if (!prose.children.length) prose.remove();

    const pager = document.getElementById("case-pager");
    [[S.projects[i - 1], "Previous", "prev"], [S.projects[i + 1], "Next", "next"]].forEach(([q, word, dir]) => {
      if (!q) return;
      const a = el("a");
      a.href = pageFor(q);
      a.dataset.dir = dir;
      a.appendChild(el("span", "label", (dir === "prev" ? "← " : "") + word + (dir === "next" ? " →" : "")));
      a.appendChild(el("span", "t", q.title));
      pager.appendChild(a);
    });
  }

  /* ---------- papers ---------- */

  function initPapers() {
    const root = document.getElementById("papers-list");
    if (!root || !S) return;

    S.papers.forEach((paper, k) => {
      const art = el("article", "paper");
      art.id = paper.id;

      const meta = el("div", "paper-meta");
      meta.appendChild(el("span", "label red", "Paper " + pad(k + 1)));
      const dl = el("dl", "facts");
      [["Date", paper.date], ["Pages", String(paper.pages)], ["For", paper.kind]].forEach(([dt, dd]) => {
        const row = el("div");
        row.appendChild(el("dt", null, dt));
        row.appendChild(el("dd", null, dd));
        dl.appendChild(row);
      });
      meta.appendChild(dl);
      art.appendChild(meta);

      const body = el("div", "paper-body");
      body.appendChild(el("h2", "paper-title", paper.title));
      paper.abstract.forEach((t) => body.appendChild(el("p", "paper-abstract", t)));

      const stats = el("div", "stats");
      paper.stats.forEach(([big, small]) => {
        const box = el("div");
        box.appendChild(el("b", null, big));
        box.appendChild(el("span", null, small));
        stats.appendChild(box);
      });
      body.appendChild(stats);

      const gos = el("div", "gos");
      gos.appendChild(goLink({ label: "Read the paper", url: paper.pdf, title: paper.title }));
      const save = el("a", "go down", "Download PDF");
      save.href = paper.pdf;
      save.setAttribute("download", slugName(paper.title).slice(0, 60) + ".pdf");
      gos.appendChild(save);
      (paper.links || []).forEach((l) => gos.appendChild(goLink(l)));
      if (paper.project) gos.appendChild(goLink({ label: "The project", url: "/case/?p=" + paper.project }));
      body.appendChild(gos);

      const fig = el("figure", "paper-fig");
      if (paper.figure.cluster) {
        const box = el("div", "cluster-fig");
        box.id = "cluster";
        box.appendChild(el("canvas"));
        const read = el("p", "cluster-readout");
        read.appendChild(el("span", null, "Live · N-body, softened gravity"));
        read.appendChild(el("b", null, "N 140"));
        box.appendChild(read);
        fig.appendChild(box);
      } else {
        const img = el("img");
        img.src = paper.figure.src;
        img.alt = paper.figure.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        fig.appendChild(img);
      }
      if (paper.figure.caption) fig.appendChild(el("figcaption", null, paper.figure.caption));
      body.appendChild(fig);

      art.appendChild(body);
      root.appendChild(art);
    });

    if (document.getElementById("cluster")) loadScript("/papers/cluster.js?v=2");

    const reports = document.getElementById("reports-list");
    if (reports) {
      S.reports.forEach((r, k) => {
        const li = el("li");
        const a = el("a");
        a.href = resolve({ url: r.pdf, title: r.title }).href;
        a.appendChild(el("span", "n", pad(k + 1)));
        a.appendChild(el("span", "t", r.title));
        a.appendChild(el("span", "s mono", r.by + " · " + r.date + " · " + r.pages + " pages"));
        li.appendChild(a);
        reports.appendChild(li);
      });
    }

    /* arriving at /papers/#id lands on that paper once it exists */
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  /* ---------- live ---------- */

  /* The map's own server decides who may frame it, and it names one origin.
     Anywhere else the screenshot stays, linking out to the real thing. */
  const FRAME_ALLOWED = ["https://leonid-elkin.github.io"];

  function initLive() {
    const tabs = Array.from(document.querySelectorAll("#live-tabs [role=tab]"));
    if (!tabs.length) return;

    const mounted = {};
    const mount = {
      map() {
        const box = document.querySelector(".map-frame");
        if (!box || FRAME_ALLOWED.indexOf(location.origin) === -1) return;
        const frame = el("iframe");
        frame.src = box.dataset.src;
        frame.title = "The Drone Strike Map, live";
        frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        box.textContent = "";
        box.appendChild(frame);
      },
      movegrade() {
        const root = document.getElementById("mg-root");
        loadScript("/case/movegrade-demo.js?v=6").then(() => {
          if (window.mountMoveGradeDemo) window.mountMoveGradeDemo(root);
        });
      },
      durak() {
        if (typeof window.startDurak === "function") window.startDurak();
      },
      commits() {
        loadScript("/live/commits.js?v=6");
      },
    };

    function open(name, push) {
      const tab = tabs.find((t) => t.dataset.panel === name) || tabs[0];
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      const key = tab.dataset.panel;
      if (!mounted[key] && mount[key]) {
        mounted[key] = true;
        mount[key]();
      }
      if (push) history.replaceState(null, "", "#" + key);
    }

    tabs.forEach((t, k) => {
      t.addEventListener("click", () => open(t.dataset.panel, true));
      t.addEventListener("keydown", (e) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = tabs[(k + step + tabs.length) % tabs.length];
        next.focus();
        open(next.dataset.panel, true);
      });
    });

    window.addEventListener("hashchange", () => open(location.hash.slice(1), false));
    open(location.hash.slice(1), false);
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
      const p = el("p", "links");
      p.appendChild(more);
      box.appendChild(p);
    }
    li.appendChild(box);
    return li;
  }

  function initAbout() {
    if (!S) return;
    const edu = document.getElementById("education-list");
    if (edu) S.education.forEach((e) => edu.appendChild(timelineItem(e.when, e.org, e.title)));

    const res = document.getElementById("research-list");
    if (res) {
      S.research.forEach((r) => {
        res.appendChild(timelineItem(r.when, r.title, r.org, r.points,
          goLink({ label: "Read about it", url: "/case/?p=" + r.slug })));
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

  /* ---------- small things ---------- */

  function initCounts() {
    if (!S) return;
    document.querySelectorAll("[data-count]").forEach((n) => (n.textContent = String(S.projects.length)));
  }

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((b) => {
      b.addEventListener("click", async () => {
        let ok = false;
        try {
          await navigator.clipboard.writeText(b.dataset.copy);
          ok = true;
        } catch (e) {
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
    initMenu();
    initCounts();
    initFeatured();
    initWork();
    initCase();
    initPapers();
    initLive();
    initAbout();
    initCopy();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
