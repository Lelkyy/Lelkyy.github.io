/* The tab library on /fuguesplit/: one folder open at a time, each folder a
 * list that scrolls on its own, and a search that looks through all of them.
 *
 * The page is complete without this file. Every shelf is in the HTML and the
 * folder links are plain anchors, so with no script the shelves simply stack
 * one after another. This adds the `ready` class that turns them into panes,
 * and keeps the open folder in the address so a link to it can be shared.
 */

(function () {
  "use strict";

  const lib = document.getElementById("lib");
  if (!lib) return;

  const shelves = Array.from(lib.querySelectorAll(".shelf"));
  if (!shelves.length) return;

  const pane = document.getElementById("lib-shelves");
  const list = document.getElementById("folder-list");
  const toggle = lib.querySelector(".lib-toggle");
  const current = document.getElementById("lib-current");
  const input = document.getElementById("lib-q");
  const count = document.getElementById("lib-count");
  const empty = document.getElementById("lib-empty");

  const folders = {};
  lib.querySelectorAll(".folder").forEach((a) => (folders[a.dataset.shelf] = a));

  /* What a search is matched against: the catalogue number and the title.
     "BWV" is dropped from both sides, so "bwv 1080", "BWV1080" and "1080"
     all find the same pieces. */
  const norm = (s) => s.toLowerCase().replace(/bwv\s*/g, "").replace(/\s+/g, " ").trim();

  /* A folder that is one work, like the Art of Fugue under BWV 1080, lends
     its number to every piece in it, so searching the number finds them. */
  function folderNumber(shelf) {
    const p = shelf.querySelector(".shelf-head p");
    const m = p && p.textContent.match(/^(BWV|RV)\s+\d+[a-z]?(?=\s|$)/i);
    return m ? m[0] : "";
  }

  const index = shelves.map((shelf) => {
    const extra = folderNumber(shelf);
    return {
      shelf,
      folder: folders[shelf.id],
      total: folders[shelf.id] ? folders[shelf.id].querySelector(".n").textContent : "",
      rows: Array.from(shelf.querySelectorAll(".pieces li")).map((li) => ({
        li,
        key: norm(extra + " " + li.querySelector(".id").textContent + " " + li.querySelector(".nm").textContent),
      })),
    };
  });

  const restingCount = count.textContent;
  const narrow = window.matchMedia("(max-width: 960px)");
  let active = shelves[0].id;
  let searching = false;

  lib.classList.add("ready");

  function nameOf(id) {
    const h = document.getElementById("h-" + id);
    return h ? h.textContent : id;
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    list.classList.toggle("open", open);
  }

  /* Open one folder. In search mode the shelves stay stacked and this only
     scrolls to the one asked for. */
  function select(id, opts) {
    const o = opts || {};
    if (!document.getElementById(id)) return;

    if (searching) {
      const target = document.getElementById(id);
      if (target.classList.contains("on")) target.scrollIntoView({ block: "start" });
      setOpen(false);
      return;
    }

    active = id;
    index.forEach(({ shelf, folder }) => {
      const on = shelf.id === id;
      shelf.classList.toggle("on", on);
      if (folder) {
        if (on) folder.setAttribute("aria-current", "true");
        else folder.removeAttribute("aria-current");
      }
    });
    current.textContent = nameOf(id);
    pane.scrollTop = 0;
    setOpen(false);

    if (o.push) history.replaceState(null, "", "#" + id);
    if (o.reveal) {
      if (folders[id] && !narrow.matches) folders[id].scrollIntoView({ block: "nearest" });
      if (narrow.matches) lib.scrollIntoView({ block: "start" });
    }
  }

  function search(text) {
    const term = norm(text);

    if (!term) {
      searching = false;
      lib.classList.remove("searching");
      index.forEach(({ rows, folder, total }) => {
        rows.forEach((r) => (r.li.hidden = false));
        if (folder) {
          folder.querySelector(".n").textContent = total;
          folder.classList.remove("none");
        }
      });
      empty.hidden = true;
      count.textContent = restingCount;
      select(active);
      return;
    }

    searching = true;
    lib.classList.add("searching");
    let hits = 0;
    let shelvesHit = 0;
    let first = null;

    index.forEach(({ shelf, rows, folder }) => {
      let n = 0;
      rows.forEach((r) => {
        const hit = r.key.indexOf(term) !== -1;
        r.li.hidden = !hit;
        if (hit) n++;
      });
      shelf.classList.toggle("on", n > 0);
      if (folder) {
        folder.querySelector(".n").textContent = n.toLocaleString("en-GB");
        folder.classList.toggle("none", n === 0);
        folder.removeAttribute("aria-current");
      }
      if (n) {
        hits += n;
        shelvesHit++;
        if (!first) first = shelf.id;
      }
    });

    empty.hidden = hits > 0;
    count.textContent = hits
      ? hits.toLocaleString("en-GB") + (hits === 1 ? " match" : " matches") +
        " in " + shelvesHit + (shelvesHit === 1 ? " folder" : " folders")
      : "No matches";
    current.textContent = hits ? "search results" : "no matches";
    pane.scrollTop = 0;
  }

  /* ---------- wiring ---------- */

  Object.keys(folders).forEach((id) => {
    folders[id].addEventListener("click", (e) => {
      e.preventDefault();
      select(id, { push: true, reveal: narrow.matches });
    });
  });

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));

  let timer = 0;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => search(input.value), 90);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      search("");
    }
  });

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (folders[id]) select(id);
  });

  const start = location.hash.slice(1);
  select(folders[start] ? start : active, { reveal: !!folders[start] });

  /* A browser that restores the search box on back or reload gets its
     results back too. */
  if (input.value) search(input.value);
})();
