/* Everything the site says about the work, in one file.
 *
 * Each project carries what the cards need and what its own page needs:
 *
 *   slug      the address of its page, /case/?p=<slug>, unless `page` is set
 *   cat       software | hardware | research | practice
 *   tier      1 shows as a card on the work page, 2 in the smaller list
 *   featured  on the home page, in the order of FEATURED below
 *   status    "live", "wip", or left out
 *   blurb     one or two lines for the card
 *   summary   the opening paragraph of its page
 *   image     a real screenshot or photo from previews/, with `fit` set to
 *             "contain" for wide scores on white and "small" for tiny ones
 *   links     the doors out: the running thing first, then the source
 *   sections  the write-up, as [heading, paragraph] pairs
 *   facts     the side column, as [label, value] pairs
 *
 * Copy rules for anything added here: short sentences, the answer first,
 * exact numbers, no parentheses and no dashes between clauses.
 */

window.SITE = (function () {
  const GH = "https://github.com/Leonid-Elkin/";

  const projects = [
    /* ---------- software ---------- */
    {
      slug: "drone-strike-map",
      title: "Drone Strike Map",
      cat: "software",
      tier: 1,
      status: "live",
      blurb: "Every reported drone and missile strike in the Russia-Ukraine war, day by day, with the outlet behind each figure.",
      summary: "A public map of every reported drone and missile strike in the Russia-Ukraine war. It reads a few dozen sources every morning, keeps each figure next to the outlet that reported it, and serves the whole dataset through an open API.",
      tags: ["Python", "SQLite", "systemd", "Leaflet"],
      image: { src: "/previews/drone-strike-map.jpg", alt: "The Drone Strike Map: Ukraine and western Russia with one day's reported strikes, and the sources for each figure in the side panel", caption: "One day on the map. The side panel lists every outlet behind each figure." },
      links: [
        { label: "Open the map", url: "https://dronestrikemap.com/" },
        { label: "Public API", url: "https://dronestrikemap.com/api/strikes" },
      ],
      sections: [
        ["The problem", "Strike reports are spread across dozens of outlets, in several languages, with different counting rules. A week later most of them are hard to find, and the aggregators that publish totals drop the sourcing."],
        ["What I built", "A scraper reads a few dozen sources every morning and stores each claim in SQLite, keyed by day. A Leaflet map steps through the days. It runs under systemd on its own server, which also serves a public JSON API."],
        ["Claims stay separate", "Claims are never merged. When two outlets give two figures for the same strike, both stay on the map as separate rows, each with its source."],
        ["Result", "It has run at dronestrikemap.com since launch and updates itself every morning without being touched. The full dataset is available through the API."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, SQLite, systemd, Leaflet"], ["Source", "Private for now"]],
    },
    {
      slug: "movegrade",
      title: "MoveGrade",
      cat: "software",
      tier: 1,
      status: "live",
      blurb: "A Chrome extension that grades every chess move on lichess and chess.com as it's played, with Stockfish running inside the extension.",
      summary: "A Chrome extension for lichess and chess.com. After every move it shows a grade, from Brilliant to Blunder, on chess.com's own thresholds. Stockfish runs inside the extension, and openings are checked against a book of 3,328 named lines before the engine is asked.",
      tags: ["JavaScript", "Chrome MV3", "Stockfish WASM", "chess.js"],
      image: { src: "/previews/movegrade.jpg", alt: "The MoveGrade panel showing a mistake, the evaluation before and after, and the engine's preferred line", caption: "The panel after 5...Nxd5 in the Fried Liver: a mistake, the eval before and after, and the line the engine preferred." },
      links: [
        { label: "Download", url: GH + "MoveGrade/releases/latest/download/MoveGrade.zip" },
        { label: "Source", url: GH + "MoveGrade" },
      ],
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
      demo: "movegrade",
    },
    {
      slug: "fuguesplit",
      title: "FugueSplit",
      cat: "software",
      tier: 1,
      status: "live",
      blurb: "Arranges Bach for a band of guitars and a bass, one voice per player. 3,449 arrangements so far, free to download.",
      summary: "FugueSplit reads a score, works out which melodic line is which, and gives each line to a different player. Every part plays one note at a time. The library on this site holds 3,449 arrangements as Guitar Pro files, and 72 of the organ works also come as a PDF for each player.",
      tags: ["Python", "PyGuitarPro", "mido", "MuseScore"],
      image: { src: "/previews/fuguesplit.jpg", alt: "Guitar Pro tablature for BWV 544, Prelude and Fugue in B minor, Guitar I and Guitar II", caption: "The opening of BWV 544, Prelude and Fugue in B minor, split across the guitars.", fit: "contain" },
      links: [
        { label: "Browse the tabs", url: "/fuguesplit/" },
        { label: "Source", url: GH + "Leonid-Elkin.github.io/tree/main/fuguesplit/src" },
      ],
      sections: [
        ["How it works", "A fugue is already written as independent lines, so the program never has to split chords. It walks the piece in time order and, at every new note, solves a small assignment problem to decide which part takes it. The cost favours parts that move by step, keeps Guitar I on top, avoids cutting off a held note and follows the source's own track layout where there is one. The pedal line goes straight to the bass."],
        ["As many players as it takes", "The band grows with the music. If a note arrives while every player is busy, a guitar is added and the piece is dealt out again. BWV 582 opens in three voices and later stacks five over the pedal."],
        ["Keeping it playable", "Each part is moved into the instrument's range by whole octaves, phrase by phrase, so the melodic shape never changes. The bass is kept in a comfortable span: across the 30 organ preludes and fugues, all 17,328 bass notes sit at or below the 12th fret. Prelude and fugue are separated automatically, by the change of metre between them or by the pedal falling silent as the subject enters."],
        ["The library", "3,449 arrangements in 29 folders, from the organ works to the cantatas, plus four Vivaldi arias. The engravings come from Tobis Notenarchiv under CC BY-NC-SA 4.0, and the arrangements carry the same licence."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, PyGuitarPro, mido, MuseScore"], ["Library", "3,449 arrangements"]],
    },
    {
      slug: "shellfall",
      title: "Shellfall",
      cat: "software",
      tier: 1,
      blurb: "A coastal-defence game: hold a fortress against a campaign of named capital ships. Released on itch.io as Penumbra.",
      summary: "A coastal-defence game. You hold a fortress against a campaign of named capital ships, lay the guns yourself and mark what to hit while the enemy keeps sailing. It's released on itch.io as Penumbra.",
      tags: ["Python", "pygame"],
      image: { src: "/previews/shellfall.jpg", alt: "Shellfall: a coastal fortress with its guns laid and the first flotilla in range", caption: "Day one of the campaign. The guns are laid and the first flotilla is in range." },
      links: [
        { label: "Play on itch.io", url: "https://elkyy.itch.io/penumbra" },
        { label: "Source", url: GH + "Penumbra" },
      ],
      sections: [
        ["How it's built", "Python and pygame. The ships, the fortress and the sea are sprites, and the campaign is a scripted sequence of named engagements. A field manual inside the game explains the guns, and a field-commands screen lets you give orders between salvos."],
        ["What it taught me", "Pacing. The first builds let you fire as fast as you could click, and every battle turned into noise. Reload timers and named ships are what made it play like a game."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, pygame"], ["Released", "itch.io, as Penumbra"]],
    },
    {
      slug: "durak",
      title: "Durak",
      cat: "software",
      tier: 1,
      status: "live",
      blurb: "The Russian card game with transfers. Play the computer here, or a friend browser to browser with no server.",
      summary: "Durak with 36 cards and transfers. You can play the computer on this page, or open a table and play a friend browser to browser. There's no server and no account.",
      tags: ["JavaScript", "WebRTC"],
      image: { src: "/previews/durak.jpg", alt: "A game of Durak in progress", caption: "A table open, a bout in progress." },
      links: [
        { label: "Play a friend online", url: "/durak-online/" },
        { label: "Source", url: GH + "Leonid-Elkin.github.io/blob/main/durak-online/durak-online.js" },
      ],
      sections: [
        ["The rules", "Thirty-six cards, with trumps taken from the bottom of the deck. The last player holding cards loses. Both games play perevodnoy durak: a defender who hasn't beaten anything yet can lay a card of the same rank and pass the whole attack on. That only works while everything on the table is unbeaten, the other player has enough cards to answer and there are fewer than six cards down."],
        ["How the online game works", "One player hosts and reads out a six-letter code, and the other joins with it. The two browsers then talk directly over WebRTC, with PeerJS handling the introduction. The host owns the game: every move from either side goes through the same rules function on the host, which sends the whole state to both players."],
        ["What broke", "WebRTC with STUN alone works between two homes and fails behind anything that rewrites addresses, like a corporate proxy or some VPNs. A TURN relay would fix it, but it needs a metered key on a server, and the game has none. The computer also plays every transfer it can, which a person wouldn't."],
      ],
      facts: [["Role", "Solo"], ["Stack", "JavaScript, WebRTC, PeerJS"]],
      demo: "durak",
    },
    {
      slug: "chess-vision-bot",
      title: "Chess Vision Bot",
      cat: "software",
      tier: 1,
      status: "wip",
      blurb: "Watches a chessboard on your screen, rebuilds the position and suggests a move. The engine is being ported to C++.",
      summary: "Watches a chessboard on your screen, rebuilds the position and says what to play. It draws the suggested move over the board and keeps an opening book for the first moves.",
      tags: ["Python", "PyQt5", "python-chess", "C++"],
      image: { src: "/previews/chess-vision-bot.jpg", alt: "The Chess Vision Bot control panel, waiting for a board to appear on screen", caption: "The control panel, engine idle, waiting for a board to appear on screen." },
      links: [],
      sections: [
        ["How it works", "A screen reader calibrated to the board's corners samples each square and matches it against the piece set. The position goes to an engine written in Python, and PyQt5 draws the suggested move over the screen."],
        ["Next", "The Python engine was fine to depth four and too slow past it, so it's being ported to C++ and checked against the Python one move for move. The detector stays in Python. MoveGrade grew out of the same detector, reading the move list in the browser instead of the screen."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, PyQt5, python-chess, C++"], ["Source", "Private until it's finished"]],
    },
    {
      slug: "sheet2tab",
      title: "Sheet2Tab",
      cat: "software",
      tier: 1,
      status: "wip",
      blurb: "Turns a PDF score into classical-guitar tablature under the notation, with an editor for the bars it misreads.",
      summary: "Give it a PDF of a score and it returns classical-guitar tablature under the notation, with an editor for the bars it misreads. It can also transcribe from a recording or a video of a page, and split the music between two, three or four guitars.",
      tags: ["Python", "PyMuPDF", "MusicXML", "LilyPond"],
      image: { src: "/previews/sheet2tab.jpg", alt: "Notation with tablature underneath for two guitars", caption: "A page of notation read into tablature for two guitars.", fit: "contain" },
      links: [{ label: "Example output", url: "/Documentation/sheet2tab_example.pdf", title: "Sheet2Tab example output" }],
      sections: [
        ["How it works", "PyMuPDF reads the page, and a staff and note reader turns the pixels into pitches and durations. A fingering pass then chooses strings and frets, a tuning that reaches the bass, and a capo if one helps. Output is engraved with LilyPond when it's installed and a built-in engraver when it isn't, and can be exported as MusicXML or MIDI."],
        ["Hearing it", "The editor plays the arrangement back and marks the moment being played in the tablature. A wrong pitch is far easier to hear than to see, so playback turned out to be the quickest way to find the reader's mistakes."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, PyMuPDF, MusicXML, LilyPond"], ["Source", "Private until it's finished"]],
    },
    {
      slug: "yavalath-pentalath",
      title: "Yavalath & Pentalath",
      cat: "software",
      tier: 1,
      blurb: "A-Level coursework: two hex board games in full, with sound and a computer opponent.",
      summary: "A-Level computer science coursework: Yavalath and Pentalath, two hex board games, built in full with rules, sound and a computer opponent. Yavalath was itself designed by a program, Cameron Browne's LUDI.",
      tags: ["Python"],
      image: { src: "/previews/yavalath.jpg", alt: "A game of Yavalath in progress on a hex board", caption: "Yavalath in play. Four in a row wins and three in a row loses." },
      links: [
        { label: "Documentation", url: "/Documentation/Yavalath_NEA_documentation.pdf", title: "Yavalath and Pentalath documentation" },
        { label: "Source", url: GH + "Computer-science-NEA-Yavalath-" },
        { label: "The rules", url: "https://boardgamegeek.com/boardgame/33767/yavalath" },
      ],
      sections: [
        ["The rules", "Four in a row wins, but three in a row loses, and that one rule makes a naive opponent throw the game. The computer searches a few plies with it in mind and prefers moves that force the other side into a losing three."],
        ["Documentation", "Written to the exam board's format: analysis, design, technical solution, testing and evaluation."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python"], ["For", "A-Level NEA"]],
    },
    {
      slug: "yt-grab",
      title: "YT Grab",
      cat: "software",
      tier: 2,
      blurb: "A Windows app that downloads YouTube videos and playlists as mp3 or mp4. One PowerShell file and a WPF window.",
      summary: "A Windows app that downloads YouTube videos and playlists as mp3 or mp4. It can merge an album playlist into one file with a tracklist, and a second tab plays songs into a virtual microphone so a voice call hears the music.",
      tags: ["PowerShell", "WPF", "yt-dlp", "NAudio"],
      image: { src: "/previews/yt-grab.jpg", alt: "The YT Grab download tab with a playlist URL and mp3 settings", caption: "The Download tab: a playlist URL, mp3 at 192 kbps, first ten items." },
      links: [{ label: "Source, zip", url: "/YTGrab_source.zip" }],
      sections: [
        ["How it's built", "One PowerShell file. The window is WPF, declared in XAML and parsed at startup. Downloads run yt-dlp and ffmpeg as child processes with their output tailed into the log, and the mic player uses NAudio to play into any output device."],
        ["What broke", "YouTube started answering 403 to every download until yt-dlp's JavaScript challenge solver, which needs deno, was wired in. The app now checks for it on start. A pasted watch URL often carries a list parameter that points at a YouTube Mix, so real playlist links are rewritten and mixes get a warning."],
      ],
      facts: [["Role", "Solo"], ["Stack", "PowerShell 5.1, WPF, yt-dlp, ffmpeg, NAudio"]],
    },
    {
      slug: "shooting-scores",
      title: "Shooting scores",
      cat: "software",
      tier: 2,
      blurb: "Plots a season of club shooting scores to show whether practice is working.",
      summary: "Plots a season of club shooting scores so you can see whether practice is working. Feed it the score sheets and it charts the trend, the spread and the outliers.",
      tags: ["Python", "matplotlib"],
      image: { src: "/previews/shooting-scores.jpg", alt: "A Walther KK300 target rifle", caption: "The rifle the scores came from, a Walther KK300." },
      links: [
        { label: "Source", url: GH + "Shooting-score-visualiser" },
        { label: "Zip", url: "/Shooting score visualiser.zip" },
      ],
      sections: [
        ["How it's built", "Python and matplotlib, reading the club's spreadsheet format. Small, and used every week for a season."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, matplotlib"]],
    },
    {
      slug: "aimtrainer",
      title: "Aimtrainer",
      cat: "software",
      tier: 2,
      blurb: "My first pygame project. Click the circles before they shrink away.",
      summary: "The first thing I made in pygame. Circles appear, you click them before they shrink away, and the score counts.",
      tags: ["Python", "pygame"],
      image: { src: "/previews/aimtrainer.jpg", alt: "Aimtrainer: circles on a plain background with a score counter", caption: "Click the circles before they go." },
      links: [
        { label: "Source", url: GH + "AimTrainer" },
        { label: "Zip", url: "/Aimtrainer_source/Aimtrainer.zip" },
      ],
      sections: [],
      facts: [["Role", "Solo"], ["Stack", "Python, pygame"]],
    },

    /* ---------- hardware ---------- */
    {
      slug: "cansat-2025",
      title: "CanSat 2025",
      cat: "hardware",
      tier: 1,
      blurb: "A can-sized satellite built by a team of seven for the CanSat competition. I built the payload radio and the antenna.",
      summary: "A can-sized satellite for the CanSat competition, built by a team of seven at Tonbridge School and taken through to a full critical design report. My part was the payload and the radio: the telemetry link and the antenna.",
      tags: ["RF", "Telemetry", "Payload"],
      image: { src: "/previews/cansat-2025.jpg", alt: "The CanSat team at the launch site with the rocket and two hand-held Yagi-Uda antennas", caption: "The team at the launch site, with the rocket and two hand-held Yagi-Uda antennas." },
      links: [{ label: "Critical design report", url: "/Documentation/Tonbridge CanSat_ReLAACS_ 2024-25 CDR .pdf", title: "CanSat 2025 critical design report" }],
      sections: [
        ["The report", "The critical design report covers the mission, the payload, the ground station and the test campaign."],
        ["What came next", "The telemetry link was the first antenna I built. The Yagi-Uda radar is the one I built afterwards to do it properly."],
      ],
      facts: [["Role", "Payload and radio"], ["Team", "Seven"], ["Year", "2024–25"]],
    },
    {
      slug: "yagi-uda-radar",
      title: "Yagi-Uda radar",
      cat: "hardware",
      tier: 1,
      status: "wip",
      blurb: "A 14.5 dBi Yagi-Uda antenna feeding RF transceivers on a Raspberry Pi 3, built to range a target.",
      summary: "A 14.5 dBi Yagi-Uda antenna feeding RF transceivers off a Raspberry Pi 3, built to range a target. The antenna works and the ranging doesn't yet.",
      tags: ["Raspberry Pi", "RF", "Antenna"],
      image: { src: "/previews/yagi-uda-radar.jpg", alt: "The 14.5 dBi Yagi-Uda antenna on the bench", caption: "The 14.5 dBi Yagi-Uda on the bench." },
      links: [{ label: "Source", url: GH + "Yagi-rifle-code" }],
      sections: [
        ["Where it came from", "CanSat. The telemetry link on the satellite was the first antenna I built, and this one came afterwards to do the job properly."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Raspberry Pi, RF transceivers, Python"]],
    },

    /* ---------- research ---------- */
    {
      slug: "neural-scaling-laws",
      title: "Neural scaling laws",
      cat: "research",
      tier: 1,
      blurb: "MLPs written from scratch in NumPy and trained at many sizes to measure how loss falls with parameters. A 57-page paper.",
      summary: "Multilayer perceptrons written from scratch in NumPy, with no framework, trained at a range of sizes to measure how test loss falls with parameter count. The library is on PyPI as elkwork, and the write-up is a 57-page paper.",
      tags: ["Python", "NumPy", "LaTeX"],
      image: { src: "/previews/neural-scaling-laws.jpg", alt: "The efficiency frontier: test loss against parameter count, one point per model", caption: "The efficiency frontier: test loss against parameter count, one point per model." },
      links: [
        { label: "Read the paper", url: "/Documentation/Investigating_neural_scaling_laws.pdf", title: "Investigating neural scaling laws" },
        { label: "elkwork on PyPI", url: "https://pypi.org/project/elkwork/" },
        { label: "Source", url: GH + "Scratch-MLP-implementation" },
        { label: "Code and models, zip", url: "/MLP all documents (2).zip" },
      ],
      sections: [
        ["Results", "98.52% on MNIST and 93.35% on FashionMNIST, and a clean power-law frontier once the models were trained to convergence. Much of what first looked like scaling turned out to depend on the optimiser."],
        ["Companion", "Drawer is the same network reading a digit you draw, one layer at a time."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, NumPy, LaTeX"], ["Output", "57-page paper, PyPI package"], ["Dates", "2024 to April 2025"]],
    },
    {
      slug: "globular-clusters",
      title: "Globular clusters",
      cat: "research",
      tier: 1,
      blurb: "Do primordial binaries change how fast a globular cluster evaporates? An N-body simulation, a paper and a poster.",
      summary: "Does a population of primordial binaries change how fast a globular cluster evaporates? An N-body simulation to test it, written up as a paper and presented as a poster.",
      tags: ["Python", "NumPy"],
      image: { src: "/previews/globular-clusters.jpg", alt: "The N-body simulation of a globular cluster, a few thousand steps in", caption: "The N-body simulation, a few thousand steps in." },
      links: [
        { label: "Read the paper", url: "/Documentation/Physics_investigation (2).pdf", title: "Globular cluster evaporation" },
        { label: "See the poster", url: "/Documentation/Physics_investigation_poster.pdf", title: "Globular cluster evaporation, poster" },
        { label: "Source", url: GH + "N-body-simulation" },
      ],
      sections: [
        ["How it's built", "NumPy, direct summation with softening and a leapfrog integrator. Runs were repeated with and without a binary population and the evaporation rates compared."],
      ],
      facts: [["Role", "Solo"], ["Stack", "Python, NumPy"], ["Output", "Paper and poster"], ["Year", "2024"]],
    },
    {
      slug: "drawer",
      title: "Drawer",
      cat: "research",
      tier: 2,
      blurb: "Draw a digit and watch the trained network read it, one layer at a time. A companion to the scaling-laws paper.",
      summary: "A companion to the scaling-laws work. Draw a digit and watch the trained network read it back, one layer at a time, using the elkwork library.",
      tags: ["Python", "NumPy", "elkwork"],
      image: { src: "/previews/drawer.jpg", alt: "A hand-drawn digit and the network's reading of it", caption: "A drawn digit, and the network's read of it." },
      links: [
        { label: "Source", url: GH + "Elkwork-live-demo" },
        { label: "Training example", url: GH + "Elkwork-training-example" },
        { label: "Zip", url: "/Drawer_source.zip" },
      ],
      sections: [],
      facts: [["Role", "Solo"], ["Stack", "Python, NumPy, elkwork"]],
    },

    /* ---------- practice ---------- */
    {
      slug: "project-euler",
      title: "Project Euler",
      cat: "practice",
      tier: 1,
      page: "/practice/euler/",
      blurb: "69 problems solved in Python. Read any solution on the site and run it in your browser.",
      summary: "69 Project Euler problems solved in Python, each file as it was written.",
      tags: ["Python", "Pyodide"],
      image: { src: "/previews/project-euler.jpg", alt: "Portrait of Leonhard Euler", fit: "small" },
      links: [
        { label: "Read the solutions", url: "/practice/euler/" },
        { label: "Source", url: GH + "Project-Euler" },
      ],
      sections: [],
      facts: [],
    },
    {
      slug: "advent-of-code-2025",
      title: "Advent of Code 2025",
      cat: "practice",
      tier: 2,
      blurb: "The December puzzles, one file a day, in Python.",
      summary: "The December puzzles, one file a day, in Python. The point was to do one every morning before anything else.",
      tags: ["Python"],
      image: { src: "/previews/advent-of-code-2025.jpg", alt: "Python source for the day one puzzle" },
      links: [
        { label: "Source", url: GH + "Advent-of-Code-2025" },
        { label: "The puzzles", url: "https://adventofcode.com/2025" },
      ],
      sections: [],
      facts: [["Stack", "Python"]],
    },
  ];

  /* The home page shows these six, in this order: two that run in public
     every day, the tab library, both papers, and the satellite. */
  const FEATURED = [
    "drone-strike-map",
    "movegrade",
    "fuguesplit",
    "neural-scaling-laws",
    "globular-clusters",
    "cansat-2025",
  ];

  const CATS = [
    ["software", "Software"],
    ["hardware", "Hardware"],
    ["research", "Research"],
    ["practice", "Practice"],
  ];

  /* about page */

  const education = [
    { when: "Now", title: "BS CSE-AI", org: "UC San Diego" },
    { when: "", title: "A-Levels", org: "Tonbridge School" },
  ];

  const research = [
    {
      when: "2024–25",
      title: "CanSat 2025: payload and radio",
      org: "Tonbridge School, team of seven",
      points: [
        "Built a can-sized satellite for the CanSat competition with six others, through to a full critical design report.",
        "Worked on the telemetry and the radio. The 14.5 dBi Yagi-Uda antenna project grew out of it.",
      ],
      slug: "cansat-2025",
    },
    {
      when: "2024 to Apr 2025",
      title: "Investigating neural scaling laws",
      org: "Independent research, 57-page paper",
      points: [
        "Wrote multilayer perceptrons from scratch in NumPy and published the library on PyPI as elkwork.",
        "Trained a range of model sizes to measure how test loss falls with parameter count. Reached 98.52% on MNIST and 93.35% on FashionMNIST.",
      ],
      slug: "neural-scaling-laws",
    },
    {
      when: "2024",
      title: "Globular cluster evaporation",
      org: "Physics investigation, paper and poster",
      points: [
        "Built an N-body simulation to test whether primordial binaries change how fast a globular cluster evaporates.",
      ],
      slug: "globular-clusters",
    },
  ];

  /* Each skill names the work that shows it, where the site has that work. */
  const skills = [
    {
      head: "Languages",
      items: [
        ["Python", "Most of the projects here"],
        ["C++", "Chess engine port"],
        ["C#", "Unity"],
        ["JavaScript", "MoveGrade, Durak, this site"],
        ["PowerShell", "YT Grab"],
      ],
    },
    {
      head: "Tools",
      items: [
        ["pygame", "Shellfall, Aimtrainer"],
        ["PyQt5", "Chess Vision Bot"],
        ["Chrome extensions, WebAssembly", "MoveGrade"],
        ["SQLite, systemd", "Drone Strike Map"],
        ["WPF, NAudio", "YT Grab"],
        ["LaTeX", "The scaling-laws paper"],
      ],
    },
    {
      head: "Hardware and radio",
      items: [
        ["Raspberry Pi", "Yagi-Uda radar"],
        ["RF transceivers", "Yagi-Uda radar"],
        ["Antenna construction", "A 14.5 dBi Yagi-Uda"],
        ["Payload design", "CanSat 2025"],
      ],
    },
    {
      head: "Machine learning",
      items: [
        ["MLPs from scratch", "elkwork, on PyPI"],
        ["Training and evaluation", "98.5% MNIST, 93.4% FashionMNIST"],
        ["Computer vision", "Chess Vision Bot"],
        ["Optical music recognition", "Sheet2Tab"],
      ],
    },
  ];

  return { projects, FEATURED, CATS, education, research, skills };
})();
