#!/usr/bin/env python3
"""Every word on the site, gathered into one file you can edit, and put back.

    *.html   ->  site-text.txt     python tools/text_sync.py
    *.html  <-   site-text.txt     python tools/text_sync.py --apply

The site has no build step and this does not add one. `site-text.txt` is not
served and nothing loads it; it is a writing surface for the copy that is
otherwise spread across fourteen hand-written pages. Export, edit the prose,
apply, and the pages are rewritten in place with nothing else touched.

What a "word on the page" means here: the text between tags. Markup,
attributes, indentation and entities are left exactly as they were, so the
diff after an apply is only the sentences you changed.

Two things follow from that, both visible in the exported file:

- **Inline tags split a sentence.** `Read the <a href="...">case study</a>.`
  arrives as three blocks, because there are three runs of text. Edit each in
  place; do not try to merge them.
- **Entities stay raw.** An em dash is `&mdash;` in the file, as it is in the
  HTML. Type a literal em dash if you would rather; both render.

Structural edits - adding a paragraph, changing a class, deleting an element -
stay a job for the HTML. This moves words, not markup.

`fuguesplit/index.html` is left out. It is a generated score viewer with
thirteen thousand runs of text in it, and none of them are site copy.
"""

import hashlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
TEXT_FILE = os.path.join(SITE, "site-text.txt")

# Everything that is not a text node: a script or style element and all its
# contents, a comment, or any single tag. The gaps between these matches are
# the words on the page.
NOT_TEXT = re.compile(
    r"<(script|style)\b[^>]*>.*?</\1\s*>"  # element and contents
    r"|<!--.*?-->"                          # comment
    r"|<[^>]*>",                            # any tag
    re.S | re.I,
)

KEY_LINE = re.compile(r"^\[([^\]\s]+)#(\d+)\]")

# Directories that hold no site copy: dot-directories, the bundled source
# drops, and the generated score viewer.
SKIP_DIRS = {"fuguesplit"}


def pages():
    """Every hand-written page, repo-relative, in a stable order."""
    found = []
    for root, dirs, files in os.walk(SITE):
        dirs[:] = sorted(
            d for d in dirs
            if not d.startswith(".")
            and not d.endswith("_source")
            and d not in SKIP_DIRS
        )
        for name in sorted(files):
            if name.endswith(".html"):
                full = os.path.join(root, name)
                found.append(os.path.relpath(full, SITE).replace("\\", "/"))
    return found


def read(rel):
    with open(os.path.join(SITE, rel), "r", encoding="utf-8", newline="") as fh:
        return fh.read()


def nodes(html):
    """Text nodes as (start, end, text), skipping runs that are only space."""
    out = []
    pos = 0
    for m in NOT_TEXT.finditer(html):
        chunk = html[pos:m.start()]
        if chunk.strip():
            out.append((pos, m.start(), chunk))
        pos = m.end()
    tail = html[pos:]
    if tail.strip():
        out.append((pos, len(html), tail))
    return out


def fingerprint(html):
    """A hash of the markup alone, so text edits do not change it.

    Its whole job is to notice that a page was edited by hand after the last
    export, which would make the numbered keys point at the wrong sentences.
    """
    tags = "".join(m.group(0) for m in NOT_TEXT.finditer(html))
    return hashlib.sha1(tags.encode("utf-8")).hexdigest()[:12]


def enclosing_tag(html, start):
    """The last opening tag before a text node, as (start, end, text)."""
    found = None
    for m in re.finditer(r"<[^>]*>", html[:start]):
        tag = m.group(0)
        if not tag.startswith("</") and not tag.startswith("<!"):
            found = (m.start(), m.end(), tag)
    return found


def context(html, start):
    """The tag just before a text node, to label its block in the file."""
    tag = enclosing_tag(html, start)
    open_tag = tag[2] if tag else None
    if open_tag is None:
        return ""
    # Long tags are noise in a writing file; keep the element and its class.
    name = re.match(r"<([a-zA-Z0-9-]+)", open_tag)
    cls = re.search(r'class="([^"]*)"', open_tag)
    label = "<" + (name.group(1) if name else "?")
    if cls:
        label += ' class="%s"' % cls.group(1)
    idx = re.search(r'id="([^"]*)"', open_tag)
    if idx and not cls:
        label += ' id="%s"' % idx.group(1)
    return label + ">"


HEADER = '''\
# Every word on the site, in one file.
#
# Edit the text under a [key] line, then put it back:
#
#     python tools/text_sync.py --apply
#
# and regenerate this file from the pages at any time with:
#
#     python tools/text_sync.py
#
# How it reads:
#
#   - A [key] line opens a block. Every line until the next [key] is its text.
#   - Do not edit, reorder or delete a [key] line - it is the address of that
#     sentence in the page. Leave a block empty to delete the words.
#   - Lines starting with # are comments and are rewritten on every export.
#     To begin a line of real text with #, write \\# instead.
#   - `fingerprint` is the markup of that page. If you edit the HTML by hand,
#     re-export before applying; a stale file is refused, not guessed at.
#   - A sentence broken by an inline tag arrives as several blocks. That is
#     the markup showing through, not a bug.
#
# This file is not served and nothing loads it.
'''


def export():
    out = [HEADER]
    total = 0
    for rel in pages():
        html = read(rel)
        found = nodes(html)
        if not found:
            continue
        total += len(found)
        out.append("")
        out.append("# " + "=" * 70)
        out.append("#  " + rel)
        out.append("# " + "=" * 70)
        out.append("# fingerprint: " + fingerprint(html))
        for i, (start, _end, chunk) in enumerate(found, 1):
            label = context(html, start)
            out.append("")
            if label:
                out.append("# " + label)
            out.append("[%s#%d]" % (rel, i))
            # These pages are CRLF on disk. The writing file is always LF;
            # apply() puts each page's own ending back, so a block that comes
            # home untouched is byte-identical.
            text = chunk.strip().replace("\r\n", "\n")
            out.append("\n".join(
                ("\\" + ln) if ln.startswith("#") else ln
                for ln in text.split("\n")
            ))
    out.append("")
    with open(TEXT_FILE, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(out))
    print("wrote %s" % os.path.relpath(TEXT_FILE, SITE))
    print("%d blocks across %d pages" % (total, len(pages())))


def parse():
    """The edited file, as {page: {index: text}} plus {page: fingerprint}."""
    if not os.path.exists(TEXT_FILE):
        sys.exit("no site-text.txt - run `python tools/text_sync.py` first")
    with open(TEXT_FILE, "r", encoding="utf-8") as fh:
        lines = fh.read().split("\n")

    blocks, prints = {}, {}
    key = None
    buf = []
    banner_page = None

    def close():
        if key is None:
            return
        rel, idx = key
        text = "\n".join(buf).strip("\n")
        text = "\n".join(
            ln[1:] if ln.startswith("\\#") else ln
            for ln in text.split("\n")
        )
        blocks.setdefault(rel, {})[idx] = text

    for line in lines:
        m = KEY_LINE.match(line)
        if m:
            close()
            key = (m.group(1), int(m.group(2)))
            buf = []
            continue
        if line.startswith("#"):
            banner = re.match(r"#\s+(\S+\.html)\s*$", line)
            if banner:
                banner_page = banner.group(1)
                continue
            fp = re.match(r"#\s*fingerprint:\s*([0-9a-f]+)\s*$", line)
            if fp and banner_page:
                prints[banner_page] = fp.group(1)
            continue
        if key is not None:
            buf.append(line)
    close()
    return blocks, prints


def apply():
    blocks, prints = parse()
    if not blocks:
        sys.exit("site-text.txt has no blocks in it")

    changed_files = 0
    changed_blocks = 0
    for rel in sorted(blocks):
        path = os.path.join(SITE, rel)
        if not os.path.exists(path):
            sys.exit("%s is in site-text.txt but not on disk - re-export" % rel)
        html = read(rel)
        want = prints.get(rel)
        if want and want != fingerprint(html):
            sys.exit(
                "%s has been edited by hand since the last export.\n"
                "Re-export (python tools/text_sync.py) and redo the edit -\n"
                "applying a stale file would rewrite the wrong sentences." % rel
            )
        found = nodes(html)
        edits = blocks[rel]
        if max(edits) > len(found):
            sys.exit("%s: block #%d does not exist - re-export" % (rel, max(edits)))

        # Splice from the end so the earlier offsets stay valid.
        nl = "\r\n" if "\r\n" in html else "\n"
        n_here = 0
        mirrored = 0
        for i in sorted(edits, reverse=True):
            start, end, chunk = found[i - 1]
            lead = chunk[:len(chunk) - len(chunk.lstrip())]
            trail = chunk[len(chunk.rstrip()):]
            edit = edits[i].replace("\r\n", "\n").replace("\n", nl)
            new = lead + edit + trail
            if new == chunk:
                continue
            html = html[:start] + new + html[end:]
            n_here += 1
            # `.overprint::before` prints `attr(data-text)` over the heading, so
            # the attribute is the same words a second time. Carry the edit into
            # it, or the ghost layer keeps saying the old thing. The tag sits
            # before the text, so this splice leaves earlier offsets alone.
            tag = enclosing_tag(html, start)
            if tag:
                t_start, t_end, text = tag
                old = chunk.strip()
                m = re.search(r'\bdata-text="([^"]*)"', text)
                if m and m.group(1) == old:
                    fixed = text[:m.start(1)] + edit.replace('"', "&quot;") + text[m.end(1):]
                    html = html[:t_start] + fixed + html[t_end:]
                    mirrored += 1
        if n_here:
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(html)
            changed_files += 1
            changed_blocks += n_here
            note = ", %d data-text" % mirrored if mirrored else ""
            print("%-34s %d block%s%s" % (
                rel, n_here, "" if n_here == 1 else "s", note))

    if changed_files:
        print("\n%d block%s in %d file%s" % (
            changed_blocks, "" if changed_blocks == 1 else "s",
            changed_files, "" if changed_files == 1 else "s"))
        print("re-export to keep site-text.txt in step: python tools/text_sync.py")
    else:
        print("nothing to change - the pages already say this")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a not in ("-h", "--help")]
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print(__doc__)
    elif args and args[0] == "--apply":
        apply()
    elif args:
        sys.exit("usage: text_sync.py [--apply]")
    else:
        export()
