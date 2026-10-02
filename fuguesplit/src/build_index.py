"""Write the shelves into the published /fuguesplit/ page.

    python build_index.py

Reads every ../<composer>/<shelf>/shelf.json that `build_shelves.py` left
and rewrites one marked block in ../index.html: the folder list on the left
and one scrollable shelf of pieces per folder on the right. The block is
delimited by HTML comments, so running this again replaces what it wrote
last time instead of piling a second copy on top.

It also refreshes every number the page quotes about the library. Any
element carrying data-stat="pieces", "folders", "pdf-pieces" or "pdfs" gets
its text replaced, so the introduction cannot drift from the shelves.

Where a piece has per-part PDFs those are linked, then the Guitar Pro file,
then the octave-dropped reading in 8ve/ where one exists.
"""

from __future__ import annotations

import argparse
import glob
import html
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, os.pardir))
INDEX = os.path.normpath(os.path.join(HERE, os.pardir, "index.html"))

BEGIN = "<!-- shelves:begin (build_index.py) -->"
END = "<!-- shelves:end -->"

# The folders, in the order the page lists them, under the heading each one
# is filed under in the folder column. The organ works come first: they are
# what the project was built for, and the only shelves with part PDFs.
GROUPS = [
    ("Organ", [
        "preludes-and-fugues",
        "art-of-fugue",
        "fugues",
        "trio-sonatas",
        "chorales",
        "organ-other",
    ]),
    ("Keyboard", [
        "well-tempered-clavier",
        "inventions-and-sinfonias",
        "keyboard-suites",
        "toccatas-and-fantasias",
        "keyboard-fugues",
        "little-preludes",
        "keyboard-variations",
        "keyboard-concertos",
        "keyboard-sonatas",
    ]),
    ("Lute, chamber and orchestra", [
        "lute-works",
        "chamber-music",
        "concertos",
        "orchestral",
        "musical-offering",
        "canons",
    ]),
    ("Vocal", [
        "cantatas",
        "passions-and-masses",
        "chorales-and-songs",
    ]),
    ("Appendix and other sources", [
        "appendix",
        "deest",
        "additions",
        "manuscripts",
    ]),
    ("Vivaldi", [
        "vivaldi-arias",
    ]),
]

# Anything not listed above still appears, filed here at the end.
OTHER = "More"

SEARCH_ICON = ('<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" '
               'stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="5"/>'
               '<path d="m11 11 3.5 3.5"/></svg>')


def heading(meta: dict) -> str:
    # Headings read as names, so no dash between the words. The catalogue
    # spans keep theirs: "BWV 525–598" is how the works are numbered.
    return re.sub(r"\s+[—–-]\s+", " ", meta["heading"]).strip()


def clean_title(piece: dict) -> str:
    """The name shown beside the catalogue number, or nothing.

    Much of the archive has no title beyond its catalogue number, and the
    number is already in the first column, so a title that only repeats it
    is left empty. A few files carry the name of a MIDI control track
    instead of a title; for those the name in the file stem is used.
    """
    name = (piece.get("title") or "").strip()
    if name == piece["label"].strip():
        return ""
    if name.lower() == "control track":
        stem = piece["stem"].split("-", 1)[-1]
        return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", stem).replace("_", " ").strip()
    return name


def display_label(label: str) -> str:
    """The catalogue number as shown. A few shelves were filed under file
    names rather than numbers, so those are tidied into words."""
    label = label.replace("_", " ").strip()
    m = re.match(r"^contrapunctus([IVXL]+)(?:-(\w+))?$", label, re.I)
    if m:
        label = "Contrapunctus " + m.group(1).upper()
        if m.group(2):
            label += ", " + m.group(2).capitalize()
    return label


def part_title(suffix: str) -> str:
    words = suffix.replace("-", " ").split()
    if words and words[0] == "guitar" and len(words) > 1:
        return f"Guitar {words[1].upper()} part, PDF"
    return f"{' '.join(words).capitalize()} part, PDF"


def piece_html(composer: str, shelf: str, piece: dict) -> str:
    base = os.path.join(ROOT, composer, shelf)
    url = f"/fuguesplit/{composer}/{shelf}"
    links = []

    # The organ shelves carry a PDF per player, engraved elsewhere.
    for pdf in sorted(glob.glob(os.path.join(
            base, "pdf", glob.escape(piece["stem"]) + "-*.pdf"))):
        file = os.path.basename(pdf)
        suffix = os.path.splitext(file)[0][len(piece["stem"]) + 1:]
        label = suffix.replace("guitar-", "").upper()
        links.append(f'<a href="{url}/pdf/{html.escape(file)}" '
                     f'title="{part_title(suffix)}">{label}</a>')

    links.append(f'<a class="gp" href="{url}/gp/{html.escape(piece["stem"])}.gp5">GP5</a>')

    if os.path.exists(os.path.join(base, "8ve", piece["stem"] + ".gp5")):
        links.append(f'<a class="gp" href="{url}/8ve/{html.escape(piece["stem"])}.gp5" '
                     f'title="Over-high parts dropped an octave">8VE</a>')

    meta = f"{piece['band']} · {piece['bars']} bars"
    if piece.get("tempo"):
        meta += f" · {piece['tempo']} bpm"

    return (f'<li><span class="id">{html.escape(display_label(piece["label"]))}</span>'
            f'<span class="nm">{html.escape(clean_title(piece))}</span>'
            f'<span class="mt">{meta}</span>'
            f'<span class="dl">{"".join(links)}</span></li>')


def count_label(n: int, word: str) -> str:
    return f"{n:,} {word}" + ("" if n == 1 else "s")


def shelf_html(meta: dict) -> str:
    shelf = meta["shelf"]
    span = meta.get("span", "").strip()
    sub = count_label(len(meta["pieces"]), "piece")
    if span:
        sub = f"{html.escape(span)} · {sub}"
    rows = "\n".join(piece_html(meta["composer"], shelf, p) for p in meta["pieces"])
    return (f'<section class="shelf" id="{shelf}" aria-labelledby="h-{shelf}">\n'
            f'<header class="shelf-head"><h2 id="h-{shelf}">{html.escape(heading(meta))}</h2>'
            f'<p>{sub}</p></header>\n'
            f'<ul class="pieces">\n{rows}\n</ul>\n'
            f'</section>\n')


def folders_html(grouped: list[tuple[str, list[dict]]]) -> str:
    out = []
    for group, metas in grouped:
        out.append(f'<p class="folder-group">{html.escape(group)}</p>')
        for m in metas:
            out.append(f'<a class="folder" href="#{m["shelf"]}" data-shelf="{m["shelf"]}">'
                       f'<span>{html.escape(heading(m))}</span>'
                       f'<span class="n">{len(m["pieces"]):,}</span></a>')
    return "\n".join(out)


def library_html(grouped: list[tuple[str, list[dict]]], stats: dict) -> str:
    metas = [m for _, ms in grouped for m in ms]
    first = metas[0]
    return f"""{BEGIN}
<div class="lib" id="lib">
<div class="lib-bar">
<label class="lib-search"><span class="sr-only">Search the library</span>{SEARCH_ICON}<input id="lib-q" type="search" placeholder="Search by BWV number or title" autocomplete="off" spellcheck="false" /></label>
<p class="lib-count" id="lib-count" aria-live="polite">{stats['pieces']:,} pieces in {stats['folders']} folders</p>
</div>
<div class="lib-body">
<div class="lib-folders">
<button class="lib-toggle" type="button" aria-expanded="false" aria-controls="folder-list"><span>Folder: <b id="lib-current">{html.escape(heading(first))}</b></span><span class="chev" aria-hidden="true">&#9662;</span></button>
<nav class="folder-list" id="folder-list" aria-label="Folders">
{folders_html(grouped)}
</nav>
</div>
<div class="lib-shelves" id="lib-shelves" tabindex="-1">
{"".join(shelf_html(m) for m in metas)}<p class="lib-empty" id="lib-empty" hidden>Nothing in the library matches that search.</p>
</div>
</div>
</div>
{END}"""


def fill_stats(page: str, stats: dict) -> str:
    def sub(m: re.Match) -> str:
        key = m.group(2)
        if key not in stats:
            return m.group(0)
        value = stats[key]
        return m.group(1) + (f"{value:,}" if isinstance(value, int) else str(value)) + m.group(3)
    return re.sub(r'(<[^>]*\bdata-stat="([a-z-]+)"[^>]*>)[^<]*(</)', sub, page)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--index", default=INDEX)
    args = ap.parse_args(argv)

    metas = {}
    # One tree per composer: bach/<shelf>/, vivaldi/<shelf>/, ...
    for path in sorted(glob.glob(os.path.join(ROOT, "*", "*", "shelf.json"))):
        with io.open(path, encoding="utf-8") as fh:
            meta = json.load(fh)
        meta.setdefault("composer",
                        os.path.basename(os.path.dirname(os.path.dirname(path))))
        if meta.get("pieces"):
            metas[meta["shelf"]] = meta
    if not metas:
        print("no shelf.json found; run build_shelves.py first", file=sys.stderr)
        return 1

    grouped = []
    placed = set()
    for group, shelves in GROUPS:
        found = [metas[s] for s in shelves if s in metas]
        placed.update(m["shelf"] for m in found)
        if found:
            grouped.append((group, found))
    rest = [metas[s] for s in sorted(metas) if s not in placed]
    if rest:
        grouped.append((OTHER, rest))

    all_metas = [m for _, ms in grouped for m in ms]
    pdf_pieces = 0
    pdfs = 0
    for m in all_metas:
        for p in m["pieces"]:
            n = len(glob.glob(os.path.join(ROOT, m["composer"], m["shelf"], "pdf",
                                           glob.escape(p["stem"]) + "-*.pdf")))
            pdfs += n
            pdf_pieces += 1 if n else 0
    stats = {
        "pieces": sum(len(m["pieces"]) for m in all_metas),
        "folders": len(all_metas),
        "pdf-pieces": pdf_pieces,
        "pdfs": pdfs,
    }

    with io.open(args.index, encoding="utf-8") as fh:
        page = fh.read()
    if BEGIN not in page or END not in page:
        print(f"{args.index} has no {BEGIN} ... {END} block to fill", file=sys.stderr)
        return 1

    start = page.index(BEGIN)
    stop = page.index(END) + len(END)
    page = page[:start] + library_html(grouped, stats) + page[stop:]
    page = fill_stats(page, stats)

    with io.open(args.index, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(page)

    print(f"{stats['folders']} folders, {stats['pieces']:,} pieces "
          f"({stats['pdf-pieces']} with {stats['pdfs']} part PDFs) written into {args.index}")
    for group, ms in grouped:
        print(f"  {group}")
        for m in ms:
            print(f"    {m['shelf']:<26} {len(m['pieces']):>5}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
