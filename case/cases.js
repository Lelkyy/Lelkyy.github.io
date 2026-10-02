/* One page per project, all served by case.html?p=<slug>. The index entry
 * (title, caption, tags, links, status) comes from `projects` in script.js;
 * this file adds the write-up: a few short sections and the fact list.
 *
 * Slugs are made from the title (see slugFor in script.js). A project with no
 * entry here still gets a page - caption, picture, links - just no prose.
 */

const CASES = {
  "movegrade": {
    picture: "The panel after 5...Nxd5 in the Fried Liver: a mistake, the eval before and after, and the line the engine preferred.",
    sections: [
      ["What it does", "After every move a badge says how good it was: Brilliant, Great, Best, Excellent, Good, Book, Forced, Inaccuracy, Mistake, Miss or Blunder. The badge sits in a small panel with its own board and eval bar, and on the square of the site's own board. A dot per move along the bottom takes you back to any earlier position."],
      ["How moves are graded", "Stockfish 16, compiled to WebAssembly with the NNUE net, evaluates the position before the move with two principal variations, then the position after. Both evaluations become a win probability using lichess's formula, and the drop for the side that moved decides the grade. The bands are chess.com's published Expected Points figures of 2, 5, 10 and 20 percentage points, because players already know that scale. Brilliant is a best move that gives up material on purpose in a position that wasn't already won. Miss means a mate or a won position was there and the move let it go."],
      ["Openings come from a book", "A gambit gives away a pawn, so the engine marks it down, and the Smith-Morra used to come out as an Inaccuracy. Book moves are now decided by a database of 3,328 named openings, 7,853 positions in all, from the ECO tables lichess publishes. Positions are keyed by the board, so a line that transposes into theory still counts. A move stays Book while the game is in the book and the player isn't clearly worse, so the Damiano Defence keeps its badge until the move that actually drops the pawn."],
      ["A fixed time per move", "The engine searches each move for a fixed time, one second by default. A fixed depth was instant in a bare ending and took many seconds in a sharp middlegame, so badges arrived at random. One second reaches about depth 14 and three seconds gets past 20. The badge is drawn faintly first and re-graded as the search deepens."],
      ["Where the engine runs", "Both sites serve their pages cross-origin isolated, and a Worker started from a frame inside such a page never loads. The first build put the engine in the panel and failed with an empty error, which took a day to trace. The engine now runs in an extension offscreen document, and one engine serves every open tab."],
      ["Reading the move list", "Lichess randomises the tag names in its move list, so there are no selectors to rely on. The content script picks the element containing the most nodes that parse as chess notation. Chess.com draws piece letters as icons, so those are folded back into text."],
      ["Live games", "In a live game against a person the panel shows Paused and does nothing. Real-time engine output in that game counts as engine assistance on both sites."],
      ["Next", "Live-game detection on chess.com still needs testing in a real logged-in game. The 40 MB net should be downloaded once and cached. A puzzle mode would hide the grade until you've chosen your own move."],
    ],
    facts: [["Role", "Solo"], ["Stack", "JavaScript, Chrome MV3, Stockfish 16 WASM, chess.js"]],
  },
  "fuguesplit": {
    picture: "The opening of BWV 544, Prelude and Fugue in B minor, split across the guitars.",
    sections: [
      ["How it works", "A fugue is already written as independent lines, so the program never has to split chords. It walks the piece in time order and, at every new note, solves a small assignment problem to decide which part takes it. The cost favours parts that move by step, keeps Guitar I on top, avoids cutting off a held note and follows the source's own track layout where there is one. The pedal line goes straight to the bass."],
      ["As many players as it takes", "The band grows with the music. If a note arrives while every player is busy, a guitar is added and the piece is dealt out again. BWV 582 opens in three voices and later stacks five over the pedal."],
      ["Keeping it playable", "Each part is moved into the instrument's range by whole octaves, phrase by phrase, so the melodic shape never changes. The bass is kept in a comfortable span: across the 30 organ preludes and fugues, all 17,328 bass notes sit at or below the 12th fret. Prelude and fugue are separated automatically, by the change of metre between them or by the pedal falling silent as the subject enters."],
      ["The library", "3,445 arrangements in 28 folders, from the organ works to the cantatas. The engravings come from Tobis Notenarchiv under CC BY-NC-SA 4.0, and the arrangements carry the same licence."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, PyGuitarPro, mido, MuseScore"], ["Library", "3,445 arrangements"]],
  },
  "penumbra": {
    picture: "Day one of the campaign: the guns are laid, the first flotilla is in range.",
    sections: [
      ["What it is", "A coastal-defence game. You hold a fortress against a campaign of named capital ships; you place the guns yourself, mark what to hit, and the enemy keeps sailing. Released on itch.io."],
      ["How it is built", "Python and pygame, with the ships, the fortress and the sea drawn as sprites and the campaign scripted as a sequence of named engagements. A field manual inside the game explains the guns; a field-commands screen lets you give orders between salvos."],
      ["What it taught", "Pacing. The first builds let you fire as fast as you could click, and every battle turned into noise. Reload timers and named ships are what made it play like a game."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, pygame"], ["Released", "itch.io"]],
  },
  "durak": {
    picture: "A table open, a bout in progress.",
    sections: [
      ["What it is", "Durak with thirty-six cards, trumps from the bottom of the deck, and the last player holding cards loses. Two ways to play: against the machine, behind the stack of cards in the corner of the page or on the Live page, or against a friend on the online table."],
      ["Transfers", "Both games play perevodnoy durak. A defender who hasn't beaten anything yet may lay a card of the same rank beside the attack and hand the whole bout back. That works only while everything on the table is unbeaten, the other side has enough cards to answer, and there are fewer than six cards down. The machine transfers when it can."],
      ["How the online game works", "There is no server. One player hosts and reads out a six-letter code; the other joins with it and the two browsers talk directly over WebRTC, with PeerJS handling the introduction. The host owns the game: every move from either side goes through the same rules function on the host, which then sends the whole state to both."],
      ["What broke", "WebRTC with STUN alone works between two homes and fails behind anything that rewrites addresses, like a corporate proxy or some VPNs. A TURN relay would fix it, but it needs a metered key on a server, and the game has none. The machine also plays every transfer it can, which a person wouldn't."],
    ],
    facts: [["Role", "Solo"], ["Stack", "JavaScript, WebRTC, PeerJS"]],
  },
  "chess-vision-bot": {
    picture: "The control panel, engine idle, waiting for a board to appear on screen.",
    sections: [
      ["What it is", "Watches a chessboard on your screen, rebuilds the position, and says what to play. It draws the suggested move over the board and keeps an opening book for the first moves."],
      ["How it works", "A screen reader calibrated to the board's corners samples each square and matches it against the piece set. The position goes to an engine written in Python, and PyQt5 draws the suggested move over the screen."],
      ["What is next", "The Python engine was fine to depth four and too slow past it, so it is being ported to C++ and checked against the Python one move for move. The detector stays in Python. MoveGrade grew out of the same detector, reading the move list in the browser instead of the screen."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, PyQt5, python-chess, C++"], ["Source", "private until it is finished"]],
  },
  "sheet2tab": {
    picture: "A page of notation read into tablature for two guitars.",
    sections: [
      ["What it is", "Give it a PDF of a score and it hands back classical-guitar tablature under the notation, with an editor for the bars it misreads. It also transcribes from a recording or a video of a page, and can split the music between two, three or four guitars."],
      ["How it works", "PyMuPDF reads the page, and a staff and note reader turns the pixels into pitches and durations. A fingering pass then chooses strings and frets, a tuning that reaches the bass, and a capo if one helps. Output is engraved with LilyPond when it is installed and a built-in engraver when it isn't, and can be exported as MusicXML or MIDI."],
      ["Hearing it", "The editor plays the arrangement back and marks the moment being played in the tablature. A wrong pitch is far easier to hear than to see, so playback turned out to be the quickest way to find the reader's mistakes."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, PyMuPDF, MusicXML, LilyPond"], ["Source", "private until it is finished"]],
  },
  "yt-grab": {
    picture: "The Download tab: a playlist URL, mp3 at 192 kbps, first ten items.",
    sections: [
      ["What it is", "A Windows app that downloads YouTube videos and playlists as mp3 or mp4, with a first-N-items option for playlists and a merge option that turns an album playlist into one file with a tracklist. A second tab plays the songs into a virtual microphone so a voice call hears the music."],
      ["How it is built", "One PowerShell file. The window is WPF, declared in XAML and parsed at startup. Downloads run yt-dlp and ffmpeg as child processes with their output tailed into the log, and the mic player uses NAudio to play into any output device."],
      ["What broke", "YouTube started answering 403 to every download until yt-dlp's JavaScript challenge solver, which needs deno, was wired in. The app now checks for it on start. A pasted watch URL often carries a list parameter that points at a YouTube Mix, so real playlist links are rewritten and mixes get a warning."],
    ],
    facts: [["Role", "Solo"], ["Stack", "PowerShell 5.1, WPF, yt-dlp, ffmpeg, NAudio"]],
  },
  "yavalath-pentalath": {
    picture: "Yavalath in play: four in a row wins, three in a row loses.",
    sections: [
      ["What it is", "A-Level computer science coursework: Yavalath and Pentalath, two hex board games, in full, with rules, sound and a computer opponent. Yavalath was itself designed by a program, Cameron Browne's LUDI, which is what made it worth building."],
      ["The rules", "Four in a row wins, but three in a row loses, and that one rule makes a naive opponent throw the game. The computer searches a few plies with it in mind and prefers moves that force the other side into a losing three."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python"], ["For", "A-Level NEA"]],
  },
  "advent-of-code-2025": {
    sections: [
      ["What it is", "The December puzzles, one file a day, in Python. Nothing clever: the point was to do one every morning before anything else."],
    ],
    facts: [["Stack", "Python"]],
  },
  "shooting-scores": {
    picture: "The rifle the scores came from: a Walther KK300.",
    sections: [
      ["What it is", "Plots a season of club shooting scores so you can see whether practice is working. Feed it the score sheets and it charts the trend, the spread and the outliers."],
      ["How it is built", "Python and matplotlib, reading the club's spreadsheet format. Small, and used every week for a season."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, matplotlib"]],
  },
  "aimtrainer": {
    picture: "Click the circles before they go.",
    sections: [
      ["What it is", "The first thing made in pygame. Circles appear, you click them before they shrink away, and the score counts. Kept because it is where the games started."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, pygame"], ["Status", "early"]],
  },
  "cansat-2025": {
    picture: "The team at the launch site, with the rocket and two hand-held Yagi-Uda antennas.",
    sections: [
      ["What it is", "A can-sized satellite for the UK CanSat competition, built by Team Re-LAACS, seven of us at Tonbridge School. The mission was remote low-altitude atmospheric composition sensing. My part was the payload and the radio: the telemetry link and the antenna."],
      ["The review", "The Critical Design Review, submitted on 31 January 2025, runs to 36 pages. It covers the mission, the payload, the ground station and the test campaign."],
      ["What came next", "The telemetry link was the first antenna I built. The Yagi-Uda radar is the one I built afterwards to do it properly."],
    ],
    facts: [["Role", "Payload and radio"], ["Team", "Re-LAACS, seven people"], ["Year", "2024-25"]],
  },
  "yagi-uda-radar": {
    picture: "The 14.5 dBi Yagi-Uda on the bench.",
    sections: [
      ["What it is", "A 14.5 dBi Yagi-Uda antenna feeding RF transceivers off a Raspberry Pi 3 to range a target. The antenna works and the ranging doesn't yet."],
      ["Where it came from", "CanSat. The telemetry link on the satellite was the first antenna I built, and this one came afterwards to do the job properly."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Raspberry Pi, RF transceivers, Python"]],
  },
  "neural-scaling-laws": {
    picture: "The compute efficiency frontier from the paper: loss against compute, one curve per model.",
    sections: [
      ["What it is", "Multilayer perceptrons written from scratch in NumPy, with no framework, trained at a range of sizes, learning rates and epoch counts to see how performance scales. The library is on PyPI as elkwork, and the write-up is a 57-page paper."],
      ["Results", "Bigger models scored better, with diminishing returns past a certain size. More epochs raised accuracy but made the larger models overfit. Higher learning rates converged faster and went unstable when pushed: the highest stable rate was 0.1 with sigmoid and 0.01 with ReLU. Cross-entropy beat mean squared error in every run."],
      ["The best model", "Built from those findings, it reached 98.51% on MNIST. That is 9.4% fewer errors than the best comparable result I could find: 1.49% against 1.63%."],
      ["Companion", "The Drawer, below, is the same network reading a digit you draw, one layer at a time."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, NumPy, LaTeX"], ["Output", "57-page paper, PyPI package"], ["Paper", "April 2025"]],
  },
  "open-clusters": {
    picture: "The N-body simulation, a few thousand steps in.",
    sections: [
      ["What it is", "How does the fraction of primordial binary stars affect how long an open cluster in the galactic disk survives? A 2D N-body simulation written for the question, run at four binary fractions and written up as a paper and a poster."],
      ["How it is built", "Python and NumPy, in two dimensions to keep the cost down. Forces are summed directly, using Newton's third law to halve the work, with no gravitational softening so close encounters resolve properly. Time steps were tuned to keep the total energy error below 10⁻⁶ %."],
      ["The runs", "Clusters started from identical conditions with 0%, 8%, 16% and 24% of stars paired into binaries. Each was run 10 times with different seeds, and a cluster counted as dissolved once half its mass was unbound."],
      ["Result", "More binaries meant longer survival. The 24% clusters lasted nearly 30,000 simulation time units longer than the clusters with none, because binaries feed energy back into the core and delay its collapse."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, NumPy"], ["Output", "paper, poster"], ["Paper", "June 2025"]],
  },
  "drawer": {
    picture: "A drawn digit, and the network's read of it.",
    sections: [
      ["What it is", "A companion to the scaling-laws work: draw a digit and watch the trained network read it back, one layer at a time. Live handwritten digit recognition with the elkwork library."],
    ],
    facts: [["Role", "Solo"], ["Stack", "Python, NumPy, elkwork"]],
  },
};

/* Projects that were renamed keep their old addresses working. */
const CASE_ALIASES = { "globular-clusters": "open-clusters", "shellfall": "penumbra", "fuguesplit": "bach-works-guitar-arranger" };

/* ---------- render ---------- */

(function () {
  const root = document.getElementById("case-copy");
  if (!root) return;

  let slug = new URLSearchParams(location.search).get("p") || "";
  if (CASE_ALIASES[slug]) {
    slug = CASE_ALIASES[slug];
    history.replaceState(null, "", "/case/?p=" + slug);
  }
  const i = projects.findIndex((p) => slugFor(p) === slug);
  const p = projects[i];

  if (!p) {
    document.getElementById("case-title").textContent = "No such project";
    document.getElementById("case-setup").textContent = "Nothing in the index answers to “" + slug + "”.";
    return;
  }

  /* a project with a page of its own lives there, not here */
  if (PAGE[p.title]) {
    location.replace(PAGE[p.title]);
    return;
  }

  const c = CASES[slug] || { sections: [], facts: [] };

  document.title = p.title + " · Leonid Elkin";
  document.getElementById("case-idx").textContent = String(i + 1).padStart(2, "0");
  const h = document.getElementById("case-title");
  h.textContent = p.title;
  h.dataset.text = p.title;
  document.getElementById("case-setup").textContent = p.summary || p.caption;

  const src = window.projectPreviewSrc && window.projectPreviewSrc(p.title);
  if (src) {
    // per-project share image (for the scrapers that run scripts)
    const og = document.querySelector('meta[property="og:image"]');
    if (og) og.content = new URL(src, location.href).href;
    const fig = document.getElementById("case-hero");
    document.getElementById("case-img").src = src;
    document.getElementById("case-img").hidden = false;
    document.getElementById("case-img").alt = p.title;
    document.getElementById("case-cap").textContent = c.picture || "";
    fig.hidden = false;
  }

  (c.sections || []).forEach(([head, body], k) => {
    const h2 = el("h2", "display case-h");
    h2.textContent = head;
    root.appendChild(h2);
    root.appendChild(el("p", null, body));
  });
  if (slug === "movegrade" && window.mountMoveGradeDemo) window.mountMoveGradeDemo(root);

  const facts = document.getElementById("case-facts");
  const row = (k, v) => {
    const d = el("div");
    d.appendChild(el("dt", "k", k));
    const dd = el("dd");
    if (typeof v === "string") dd.textContent = v; else dd.appendChild(v);
    d.appendChild(dd);
    facts.appendChild(d);
  };
  if (p.status) row("Status", el("span", "status " + p.status, STATUS_LABEL[p.status]));
  (c.facts || []).forEach(([k, v]) => row(k, v));
  if (p.tags && p.tags.length) row("Tags", p.tags.join(", "));
  p.links.forEach((l) => row(l.name, linkEl(l)));

  const prev = projects[i - 1], next = projects[i + 1];
  const a1 = document.getElementById("case-prev"), a2 = document.getElementById("case-next");
  if (prev) { a1.href = pageFor(prev); a1.textContent = "← " + prev.title; } else a1.remove();
  if (next) { a2.href = pageFor(next); a2.textContent = next.title + " →"; } else a2.remove();
})();
