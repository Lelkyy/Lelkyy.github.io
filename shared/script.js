/* Content and rendering for the home page (skills, research) and the projects
 * page (index + category filter).
 *
 * Every project carries a category (software | hardware | research), a caption
 * written for a reader rather than a search engine, tech tags, links, and a
 * status. A link with `pending: true` renders greyed with a "soon" tag instead
 * of 404ing.
 *
 * Anything still wrapped in [ square brackets ] is a slot nobody has filled -
 * it renders in the loud placeholder treatment at the foot of style.css so it
 * cannot be mistaken for finished copy.
 */

/* ---------- projects ---------- */

const projects = [
  /* strongest first; the index and the case pages number them in this order */
  {
    title: "Drone Strike Map",
    cat: "software",
    status: "live",
    featured: true,
    caption:
      "Every reported drone and missile strike in the Russia-Ukraine war, day by day, with the outlet behind each figure. 51 sources in 3 languages, read every 30 minutes, and a public API.",
    tags: ["Python", "SQLite", "systemd", "Leaflet"],
    links: [
      { name: "see it live", url: "/live/#map" },
      { name: "open the map", url: "https://dronestrikemap.com/" },
      { name: "public API", url: "https://dronestrikemap.com/api/strikes" },
    ],
  },
  {
    title: "MoveGrade",
    cat: "software",
    status: "live",
    caption:
      "A Chrome extension that grades every chess move on lichess and chess.com as it's played, from Brilliant to Blunder, on chess.com's own thresholds. Stockfish runs inside the extension, and openings are checked against a book of 3,328 named lines first.",
    summary:
      "A Chrome extension for lichess and chess.com. After every move it shows a grade, from Brilliant to Blunder, on chess.com's own thresholds. Stockfish runs inside the extension, and openings are checked against a book of 3,328 named lines before the engine is asked.",
    tags: ["JavaScript", "Chrome extension", "Stockfish WASM", "chess.js"],
    links: [
      { name: "try it live", url: "/live/#movegrade" },
      { name: "download", url: "https://github.com/Lelkyy/MoveGrade/archive/refs/heads/main.zip" },
      { name: "source", url: "https://github.com/Lelkyy/MoveGrade" },
    ],
  },
  {
    title: "Bach Works Guitar Arranger",
    cat: "software",
    status: "live",
    caption:
      "Arranges Bach for a band of guitars and a bass, one voice per player and one note at a time. 3,445 arrangements are published as Guitar Pro files, and 72 organ movements also come as a PDF per player, notation over tablature.",
    summary:
      "The arranger reads a score, works out which melodic line is which, and gives each line to a different player. Every part plays one note at a time. The library holds 3,445 arrangements as Guitar Pro files, and 72 of the organ works also come as a PDF for each player.",
    tags: ["Python", "PyGuitarPro", "mido", "MuseScore"],
    links: [
      { name: "the library", url: "/fuguesplit/" },
      { name: "source", url: "https://github.com/Lelkyy/Lelkyy.github.io/tree/main/fuguesplit/src" },
    ],
  },
  {
    title: "Neural scaling laws",
    cat: "research",
    caption:
      "Multilayer perceptrons written from scratch in NumPy, trained at many sizes, learning rates and epoch counts to see how performance scales. The library is on PyPI as elkwork; the paper is 57 pages.",
    tags: ["Python", "NumPy", "LaTeX"],
    links: [
      { name: "the paper", url: "/Documentation/Investigating_neural_scaling_laws.pdf", title: "Investigating Neural Scaling Laws in a Multilayer Perceptron" },
      { name: "elkwork on PyPI", url: "https://pypi.org/project/elkwork/" },
      { name: "source", url: "https://github.com/Lelkyy/Scratch-MLP-implementation" },
      { name: "code and models", url: "/MLP all documents (2).zip" },
    ],
  },
  {
    title: "Penumbra",
    cat: "software",
    status: "live",
    caption:
      "Hold a coastal fortress against a campaign of named capital ships. You lay the guns yourself and mark what to hit while the enemy keeps sailing. Released on itch.io.",
    tags: ["Python", "pygame"],
    links: [
      { name: "play on itch.io", url: "https://elkyy.itch.io/penumbra" },
      { name: "source", url: "https://github.com/Lelkyy/Penumbra" },
    ],
  },
  {
    title: "Open clusters",
    cat: "research",
    caption:
      "Do primordial binary stars change how long an open cluster survives? A 2D N-body simulation run at four binary fractions, a paper and a poster.",
    tags: ["Python", "NumPy"],
    links: [
      { name: "the paper", url: "/Documentation/Physics_investigation (2).pdf", title: "How Does the Primordial Binary Fraction Affect the Survival Time of an Open Cluster in the Galactic Disk?" },
      { name: "the poster", url: "/Documentation/Physics_investigation_poster.pdf", title: "Primordial binaries and open cluster survival, poster" },
      { name: "source", url: "https://github.com/Lelkyy/N-body-simulation" },
    ],
  },
  {
    title: "CanSat 2025",
    cat: "hardware",
    caption:
      "A can-sized satellite for the UK CanSat competition, built by Team Re-LAACS, seven of us at Tonbridge School. My part was the payload and the radio.",
    tags: ["RF", "telemetry", "payload"],
    links: [
      {
        name: "critical design review",
        url: "/Documentation/Tonbridge CanSat_ReLAACS_ 2024-25 CDR .pdf",
        title: "Team Re-LAACS Critical Design Review",
      },
    ],
  },
  {
    title: "Yagi-Uda radar",
    cat: "hardware",
    status: "wip",
    caption:
      "A 14.5 dBi Yagi-Uda feeding RF transceivers off a Raspberry Pi 3 to range a target. The antenna works and the ranging doesn't yet.",
    tags: ["Raspberry Pi", "RF", "antenna"],
    links: [{ name: "source", url: "https://github.com/Lelkyy/Yagi-rifle-code" }],
  },
  {
    title: "Chess Vision Bot",
    cat: "software",
    status: "wip",
    caption:
      "Watches a chessboard on your screen, rebuilds the position and says what to play. The engine is being ported to C++ for speed.",
    tags: ["Python", "PyQt5", "python-chess", "C++"],
    links: [],
  },
  {
    title: "Sheet2Tab",
    cat: "software",
    status: "wip",
    caption:
      "Give it a PDF of a score and it hands back classical-guitar tablature under the notation, with an editor for the bars it misreads. Also transcribes from a recording or a video of a page.",
    tags: ["Python", "PyMuPDF", "MusicXML"],
    links: [{ name: "example output", url: "/Documentation/sheet2tab_example.pdf", title: "Sheet2Tab example output" }],
  },
  {
    title: "Durak",
    cat: "software",
    status: "live",
    caption:
      "The Russian card game, with transfers. Play the machine right here on this page, or open a table and play a friend browser to browser. No server and no account.",
    tags: ["JavaScript", "WebRTC"],
    links: [
      { name: "play here", url: "#durak" },
      { name: "play online", url: "/durak-online/" },
      { name: "source", url: "https://github.com/Lelkyy/Lelkyy.github.io/blob/main/durak-online/durak-online.js" },
    ],
  },
  {
    title: "Yavalath & Pentalath",
    cat: "software",
    caption:
      "A-Level coursework: both hex board games in full, with sound and a computer opponent. Yavalath was itself designed by a program.",
    tags: ["Python"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/Computer-science-NEA-Yavalath-" },
      { name: "the rules", url: "https://boardgamegeek.com/boardgame/33767/yavalath" },
    ],
  },
  {
    title: "YT Grab",
    cat: "software",
    status: "live",
    caption:
      "A Windows app that downloads YouTube videos and playlists as mp3 or mp4, merges a playlist into one file, and can play the songs into a virtual microphone for a voice call. One PowerShell file and a WPF window.",
    tags: ["PowerShell", "WPF", "yt-dlp", "NAudio"],
    links: [{ name: "source", url: "/YTGrab_source.zip" }],
  },
  {
    title: "Drawer",
    cat: "research",
    caption:
      "A companion to the MLP work: draw a digit and watch the trained network read it back, one layer at a time.",
    tags: ["Python", "NumPy"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/Elkwork-live-demo" },
      { name: "training example", url: "https://github.com/Lelkyy/Elkwork-training-example" },
      { name: "zip", url: "/Drawer_source.zip" },
    ],
  },
  {
    title: "Project Euler",
    cat: "software",
    caption: "Sixty-nine solved, each solution as it was written. The Python runs in your browser.",
    tags: ["Python", "Pyodide"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/Project-Euler" },
      { name: "the archive", url: "https://projecteuler.net/archives" },
    ],
  },
  {
    title: "Advent of Code 2025",
    cat: "software",
    caption: "The December puzzles, one file a day.",
    tags: ["Python"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/Advent-of-Code-2025" },
      { name: "the puzzles", url: "https://adventofcode.com/2025" },
    ],
  },
  {
    title: "Shooting scores",
    cat: "software",
    caption: "Plots a season of club scores so you can see whether practice is working.",
    tags: ["Python"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/Shooting-score-visualiser" },
      { name: "zip", url: "/Shooting score visualiser.zip" },
    ],
  },
  {
    title: "Aimtrainer",
    cat: "software",
    status: "old",
    caption: "The first thing made in PyGame. Click the circles before they go.",
    tags: ["Python", "pygame"],
    links: [
      { name: "source", url: "https://github.com/Lelkyy/AimTrainer" },
      { name: "zip", url: "/Aimtrainer_source/Aimtrainer.zip" },
    ],
  },
];

/* ---------- skills ---------- */

/* Every line names the work that evidences it - no invented levels or
   percentages. */
const skills = [
  {
    head: "Languages",
    items: [
      { name: "Python", via: "most of the above" },
      { name: "C++", via: "chess engine port" },
      { name: "C", via: "a CMake game engine" },
      { name: "C#", via: "Unity" },
      { name: "JavaScript", via: "this site" },
      { name: "PowerShell", via: "YT Grab" },
    ],
  },
  {
    head: "Frameworks & tools",
    items: [
      { name: "pygame", via: "Penumbra, Aimtrainer" },
      { name: "PyQt5", via: "Chess Vision Bot" },
      { name: "WPF, NAudio", via: "YT Grab" },
      { name: "Chrome extensions (MV3), WebAssembly", via: "MoveGrade" },
      { name: "SQLite + systemd", via: "Drone Strike Map" },
      { name: "PyMuPDF, MusicXML", via: "Sheet2Tab" },
      { name: "LaTeX", via: "the scaling-laws paper" },
    ],
  },
  {
    head: "Hardware & radio",
    items: [
      { name: "Raspberry Pi", via: "Yagi-Uda radar" },
      { name: "RF transceivers", via: "Yagi-Uda radar" },
      { name: "Antenna construction", via: "14.5 dBi Yagi-Uda" },
      { name: "Payload design", via: "CanSat 2025" },
    ],
  },
  {
    head: "Machine learning",
    items: [
      { name: "MLPs from scratch", via: "elkwork, on PyPI" },
      { name: "Training and evaluation", via: "98.51% on MNIST" },
      { name: "Computer vision", via: "Chess Vision Bot" },
      { name: "Optical music recognition", via: "Sheet2Tab" },
    ],
  },
];

/* ---------- helpers ---------- */

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

const isExternal = (url) => /^https?:\/\//i.test(url);

/* A string wrapped in [ brackets ] is an unfilled slot. */
const isSlot = (s) => typeof s === "string" && /^\s*\[.*\]\s*$/.test(s);

function linkEl(link) {
  const a = el("a", null, link.name);
  if (link.pending || !link.url) {
    a.href = "";
    a.classList.add("disabled");
    a.setAttribute("aria-disabled", "true");
    a.tabIndex = -1;
    const wrap = el("span");
    wrap.appendChild(a);
    const why = link.why || "not published yet";
    wrap.appendChild(el("span", "soon", "soon"));
    wrap.title = why;
    wrap.appendChild(el("span", "why", ", " + why));
    return wrap;
  }
  a.href = link.url;
  if (isExternal(link.url)) {
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    /* An internal link that is not a page is a file, and a file is offered
       as a download. Test the path alone: a page link carries a query
       (case.html?p=<slug>) or is a bare fragment (#durak), and matching the
       whole URL made those look extension-less - so the browser saved the
       page to disk instead of opening it. */
    const path = link.url.split(/[?#]/)[0];
    if (/\.pdf$/i.test(path)) {
      /* A paper is meant to be read, so it opens in the site's own reader
         rather than landing in the downloads folder. Saving a copy is still
         one click away, on that page. */
      a.href = "/doc/?f=" + encodeURIComponent(path) + (link.title ? "&t=" + encodeURIComponent(link.title) : "");
    } else if (path && !/\.html?$/i.test(path)) {
      a.setAttribute("download", "");
    }
  }
  return a;
}

const STATUS_LABEL = { live: "live", wip: "in progress", old: "early", placeholder: "placeholder" };

/* The running number in the left column - what stands where a thumbnail would
   on a site that used images. This one does not. The category sits under the
   number on the index, where it is doing filing work; the home page drops it,
   because a hand-picked shortlist is not a filing system. */
function plate(n, p, showCat = true) {
  const box = el("div", "plate" + (p.placeholder ? " is-placeholder" : ""));
  box.setAttribute("aria-hidden", "true");
  box.append(String(n).padStart(2, "0"));
  if (showCat) box.append(el("span", "plate-cat", p.cat || ""));
  return box;
}

/* the drawn vignette, or the honest hatched slot when there is none */
function previewEl(p) {
  const box = el("div", "pv");
  const svg = window.projectPreview && window.projectPreview(p.title);
  if (svg) box.innerHTML = svg;
  else box.classList.add("pv-empty");
  box.setAttribute("aria-hidden", "true");
  return box;
}

/* Every project has a page. Most are case.html?p=<slug>; a few have a page
   of their own. The slug is the title, lower-cased, non-letters to hyphens. */
const PAGE = {
  "Drone Strike Map": "/project/",
  "Bach Works Guitar Arranger": "/fuguesplit/",
  "Project Euler": "/practice/euler/",
};

function slugFor(p) {
  return p.title.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pageFor(p) {
  return PAGE[p.title] || "/case/?p=" + slugFor(p);
}

/* the page first, then whatever the entry lists */
function allLinks(p) {
  return [{ name: "about", url: pageFor(p) }].concat(p.links || []);
}

/* first real destination a card can take you to */
function primaryLink(p) {
  return allLinks(p).find((l) => l.url && !l.pending) || null;
}

function projectCard(p, i, opts = {}) {
  const card = el("article", "project-card");
  card.dataset.cat = p.cat;
  if (p.featured) card.classList.add("featured");

  card.appendChild(plate(i + 1, p, !opts.plainPlate));
  card.appendChild(previewEl(p));

  const body = el("div", "project-body");
  const top = el("div", "top");
  top.appendChild(el("h3", null, p.title));
  const st = p.placeholder ? "placeholder" : p.status;
  if (st) top.appendChild(el("span", "status " + st, STATUS_LABEL[st]));
  body.appendChild(top);

  body.appendChild(
    el("p", "caption" + (isSlot(p.caption) ? " placeholder" : ""), p.caption)
  );

  if (p.tags && p.tags.length) {
    const ul = el("ul", "tags");
    p.tags.forEach((t) => ul.appendChild(el("li", null, t)));
    body.appendChild(ul);
  }

  card.appendChild(body);

  /* Links are a sibling of the body, not a child: the entry is a grid
     (number | preview | text | links) and the links column is flush right. */
  const links = el("div", "links");
  allLinks(p).forEach((l) => links.appendChild(linkEl(l)));
  card.appendChild(links);

  /* The whole entry is the door, not just the small link: a cover anchor
     stretches over the card, pointing where the first real link points.
     The individual links sit above it and still work on their own. */
  const first = primaryLink(p);
  if (first) {
    const cover = el("a", "card-cover");
    cover.href = first.url;
    if (isExternal(first.url)) {
      cover.target = "_blank";
      cover.rel = "noopener";
    }
    cover.setAttribute("aria-label", p.title + ", " + first.name);
    card.appendChild(cover);
    card.classList.add("has-cover");
  }

  return card;
}

/* ---------- projects page ---------- */

function initProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  const frag = document.createDocumentFragment();
  projects.forEach((p, i) => frag.appendChild(projectCard(p, i)));
  grid.appendChild(frag);

  const cards = Array.from(grid.children);
  const buttons = Array.from(document.querySelectorAll(".filter"));
  const countEl = document.getElementById("project-count");

  const counts = { all: cards.length };
  cards.forEach((c) => (counts[c.dataset.cat] = (counts[c.dataset.cat] || 0) + 1));
  buttons.forEach((b) => {
    const c = b.querySelector(".count");
    if (c) c.textContent = counts[b.dataset.filter] || 0;
  });

  function apply(filter, { push = true } = {}) {
    if (!buttons.some((b) => b.dataset.filter === filter)) filter = "all";
    let shown = 0;
    cards.forEach((c) => {
      const on = filter === "all" || c.dataset.cat === filter;
      c.hidden = !on;
      if (on) shown++;
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.filter === filter ? "true" : "false"));
    if (countEl) countEl.textContent = shown === 1 ? "1 project" : shown + " projects";
    if (push && grid.dataset.hash !== "off") history.replaceState(null, "", filter === "all" ? location.pathname : "#" + filter);
  }

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
  apply(grid.dataset.hash === "off" ? "all" : (location.hash || "").replace("#", ""), { push: false });
}

/* ---------- home: selected work ----------
   The home page carries five entries, not the index. These five because each
   one answers a different question: is it real (live and public), was it
   written up (a paper), does anyone use it (installed), does the physics hold
   (an N-body simulation), and does it ship at scale (3,445 arrangements). Everything else is one click away on the projects index. Titles, so
   the picks track the entries above rather than their positions.

   They are numbered from one in the order listed here: a shortlist counts
   itself, rather than quoting its members' places in the full index. */

const HOME_PICKS = [
  "MoveGrade",
  "Bach Works Guitar Arranger",
  "Penumbra",
  "CanSat 2025",
];

/* The home page shows its picks as rows of picture and text, alternating
   sides, rather than the index's numbered list. */
function featureRow(p) {
  const row = el("article", "feature");
  const shot = el("a", "feature-shot");
  shot.href = pageFor(p);
  shot.setAttribute("aria-hidden", "true");
  shot.tabIndex = -1;
  const src = window.projectPreviewSrc && window.projectPreviewSrc(p.title);
  if (src) {
    const img = el("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    shot.appendChild(img);
  }
  row.appendChild(shot);

  const text = el("div", "feature-text");
  const eyebrow = el("p", "eyebrow");
  eyebrow.textContent = (p.cat || "") + (p.status === "live" ? " \u00b7 live" : p.status === "wip" ? " \u00b7 in progress" : "");
  text.appendChild(eyebrow);
  const h = el("h3");
  const a = el("a", null, p.title);
  a.href = pageFor(p);
  h.appendChild(a);
  text.appendChild(h);
  text.appendChild(el("p", "feature-caption", p.caption));
  if (p.tags && p.tags.length) {
    const ul = el("ul", "tags");
    p.tags.forEach((t) => ul.appendChild(el("li", null, t)));
    text.appendChild(ul);
  }
  const links = el("p", "feature-links");
  allLinks(p).filter((l) => l.url && l.url !== "#durak").slice(0, 3).forEach((l) => links.appendChild(linkEl(l)));
  text.appendChild(links);
  row.appendChild(text);
  return row;
}

function initFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  HOME_PICKS.forEach((title) => {
    const p = projects.find((q) => q.title === title);
    if (p) grid.appendChild(featureRow(p));
  });
}

/* ---------- skills ---------- */

/* One column, whatever the page wants in it - about.html asks for the whole
   list, the home page asks for a shortlist. Both get the same markup, so the
   two pages cannot drift apart in how a skill is drawn. */
function skillColumn(head, items) {
  const box = el("div", "skill-col");
  box.appendChild(el("h3", null, head));
  const ul = el("ul");
  items.forEach((it) => {
    const li = el("li");
    li.appendChild(el("span", it.placeholder ? "placeholder" : null, it.name));
    li.appendChild(el("span", "via" + (it.placeholder ? " placeholder" : ""), it.via));
    ul.appendChild(li);
  });
  box.appendChild(ul);
  return box;
}

function initSkills() {
  const root = document.getElementById("skill-cols");
  if (!root) return;
  skills.forEach((col) => root.appendChild(skillColumn(col.head, col.items)));
}

/* Under the name on the home page: every skill, but only the names of them.
   The evidence each one carries is the whole point of about.html's version
   and the whole reason that one is long; here the job is to say the range in
   a few lines and get out of the way. Same `skills` array either way, so the
   two cannot list different things. */
function initHeroSkills() {
  const root = document.getElementById("hero-skills");
  if (!root) return;
  skills.forEach((col) => {
    const row = el("div");
    row.appendChild(el("dt", "k", col.head));
    const dd = el("dd");
    /* No placeholder treatment here: it is the `via` that is unfilled on such
       an entry, and this list does not show the via. Flagging the name itself
       would light up a skill that is not in doubt - about.html still marks
       the missing evidence, which is where the evidence is claimed. */
    col.items.forEach((it, i) => {
      if (i) dd.append(" · ");
      dd.append(it.name);
    });
    row.appendChild(dd);
    root.appendChild(row);
  });
}

/* ---------- home: the live map ---------- */

/* The Drone Strike Map is framed here rather than photographed. Its own server
 * decides who is allowed to do that - the content policy it serves names this
 * site - so the frame is only mounted from an origin on that list. Anywhere
 * else (a local preview, a fork, someone's mirror) the still underneath
 * stands, which is also what a visitor without scripting sees. Better a
 * picture that loads than a frame the browser refuses and leaves blank.
 */
/* Empty until the map's server names this site in its frame-ancestors
   header; add "https://lelkyy.github.io" here once it does. */
const FRAME_ALLOWED = [];

function initLiveFrame() {
  const box = document.querySelector(".live-embed");
  if (!box) return;

  const src = box.dataset.liveSrc;
  if (!src) return;
  if (FRAME_ALLOWED.indexOf(location.origin) === -1) return;

  const frame = el("iframe", "live-frame");
  frame.src = src;
  frame.title = "The Drone Strike Map, live";
  frame.loading = "lazy";
  frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

  box.textContent = "";
  box.appendChild(frame);
  box.classList.add("is-live");
}

/* ---------- counts quoted in the chrome ---------- */

function initCounts() {
  const n = projects.length;
  document.querySelectorAll("[data-project-count]").forEach((node) => {
    node.textContent =
      node.dataset.projectCount === "pad" ? String(n).padStart(2, "0") : String(n);
  });
}

/* ---------- today's date in the hero eyebrow ---------- */

/* The eyebrow used to number the index. It reads as a dateline instead: the
   day and month in red, the year after it, taken from the reader's clock so
   the page is never stale. */
function initToday() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-GB", { month: "long" });
  const year = String(now.getFullYear());
  const iso = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(day).padStart(2, "0");

  document.querySelectorAll("[data-today]").forEach((node) => {
    node.textContent = node.dataset.today === "y" ? year : day + " " + month;
    if (node.tagName === "TIME") node.setAttribute("datetime", iso);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initProjects();
  initFeatured();
  initHeroSkills();
  initSkills();
  initLiveFrame();
  initCounts();
  initToday();
});
