/* The sheet-music page. It takes one Guitar Pro file from the library
 * (?f=bach/<shelf>/gp/<stem>.gp5) and engraves it in the browser with
 * alphaTab, one part at a time or the full score, notation over tablature.
 * "Save as PDF" prints the engraving alone, so every piece in the library
 * has a PDF without one being stored for it.
 */

(function () {
  const CDN = "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.8.4/dist/";

  const q = new URLSearchParams(location.search);
  const file = q.get("f") || "";
  const given = (q.get("t") || "").trim();

  const titleEl = document.getElementById("score-title");
  const printTitle = document.getElementById("score-print-title");
  const partsEl = document.getElementById("score-parts");
  const saveBtn = document.getElementById("score-save");
  const gpLink = document.getElementById("score-gp");
  const status = document.getElementById("score-status");
  const sheet = document.getElementById("score");

  function say(text) {
    status.textContent = text;
    status.hidden = !text;
  }

  // Only files from the library itself.
  if (!/^bach\/[a-z0-9-]+\/(gp|8ve)\/[A-Za-z0-9._-]+\.gp5$/.test(file) || file.includes("..")) {
    titleEl.textContent = "Piece not found";
    say("This link doesn't point at a piece in the library.");
    return;
  }
  if (typeof alphaTab === "undefined") {
    say("The engraver didn't load. Check the connection and reload the page.");
    return;
  }

  const url = "/fuguesplit/" + file;
  gpLink.href = url;

  let title = given || file.split("/").pop().replace(/\.gp5$/, "").replace(/_/g, " ");
  let part = "";

  function setTitle() {
    titleEl.textContent = title;
    printTitle.textContent = part ? title + ", " + part : title;
    document.title = (part ? title + " · " + part : title) + " · Bach Works Guitar Arranger";
  }
  setTitle();

  const api = new alphaTab.AlphaTabApi(sheet, {
    core: {
      fontDirectory: CDN + "font/",
      useWorkers: false,
      enableLazyLoading: false,
    },
    display: {
      layoutMode: alphaTab.LayoutMode.Page,
      staveProfile: alphaTab.StaveProfile.ScoreTab,
      scale: 0.9,
    },
    player: { enablePlayer: false },
  });

  say("Engraving the score");
  saveBtn.disabled = true;

  function show(tracks, name, button) {
    part = name;
    setTitle();
    partsEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    saveBtn.disabled = true;
    say("Engraving the score");
    api.renderTracks(tracks);
  }

  api.scoreLoaded.on((score) => {
    if (!given && score.title) title = score.title;
    const tracks = score.tracks;
    partsEl.innerHTML = "";
    tracks.forEach((track, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn small";
      b.textContent = track.name || "Part " + (i + 1);
      b.addEventListener("click", () => show([track], b.textContent, b));
      partsEl.appendChild(b);
    });
    if (tracks.length > 1) {
      const all = document.createElement("button");
      all.type = "button";
      all.className = "btn small";
      all.textContent = "Full score";
      all.addEventListener("click", () => show(tracks, "", all));
      partsEl.appendChild(all);
    }
    const first = partsEl.querySelector("button");
    if (first) {
      first.setAttribute("aria-pressed", "true");
      part = tracks.length > 1 ? first.textContent : "";
    }
    setTitle();
  });

  api.renderFinished.on(() => {
    say("");
    saveBtn.disabled = false;
  });

  api.error.on(() => {
    say("This piece couldn't be engraved. The Guitar Pro file is still available to download.");
  });

  saveBtn.addEventListener("click", () => window.print());

  // Fetched here rather than by alphaTab, so a missing file says so.
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.arrayBuffer();
    })
    .then((buf) => api.load(new Uint8Array(buf)))
    .catch(() => {
      gpLink.style.display = "none";
      say("This piece isn't in the library.");
    });
})();
