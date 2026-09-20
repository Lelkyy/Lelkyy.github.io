# tools/

Three scripts. None of them is part of the site — GitHub Pages serves files
and runs nothing. Standard library Python, nothing to install.

## Adding a solution

Nothing here. Put the file in `Euler_source/` or `LeetCode/` and push.
`.github/workflows/solutions.yml` runs `build_solutions.py` and commits the
regenerated index back, so the folder is the only thing you maintain.

```
Euler_source/42.py          problem 42, in Python
LeetCode/1.py               problem 1
LeetCode/1.cpp              problem 1 again - the page shows both as tabs
LeetCode/1440/1440.py       a folder when the solution reads a file
LeetCode/1440/data.txt      ...that file, offered as a download beside the code
```

`LeetCode/README.md` has the details.

## build_solutions.py

Walks both folders and writes `data/euler-solutions.js` and
`data/leetcode-solutions.js` — the two files the pages load. Run it by hand if
you want to see the result before pushing:

```sh
cd tools
python build_solutions.py            # both
python build_solutions.py leetcode   # just one
```

It prints what it found and, usefully, what it skipped. A file whose name does
not start with a problem number is skipped and named, so a typo shows up as a
line of output rather than a silently missing entry.

Two behaviours worth knowing:

- **A folder beats a loose file** of the same number and language. `22.py` and
  `22/22.py` both exist in `Euler_source/`; the folder one wins, because if a
  problem reads a data file then the folder is the working copy.
- **Encodings vary.** These were written on Windows over several years, so each
  file is tried as UTF-8, then cp1252, then latin-1 before giving up.

## text_sync.py

Every word on the fourteen pages, in one file, so changing a sentence does not
mean opening a page and hunting for it.

```sh
python tools/text_sync.py           # pages  -> site-text.txt
# edit site-text.txt in anything
python tools/text_sync.py --apply   # pages <-  site-text.txt
```

`site-text.txt` is not served and nothing loads it — it is a writing surface,
not a content file, and the HTML stays the only source of truth. It looks like
this:

```
# <h1 class="display overprint">
[index.html#14]
Leonid Elkin
```

Edit the text under a key; leave the key alone. Apply rewrites only those runs
of text, so the diff afterwards is the sentences you changed and nothing else —
markup, attributes, indentation and CRLF endings all survive untouched.

Four behaviours worth knowing:

- **A stale file is refused, not guessed at.** Each page carries a
  `fingerprint` of its markup. Edit a page by hand after exporting and
  `--apply` stops rather than writing sentences into the wrong elements.
  Re-export and redo the edit.
- **Inline tags split a sentence.** `Read the <a href="...">case study</a>.` is
  three runs of text, so three blocks. Edit each in place.
- **`data-text` is carried along.** The display headings print themselves twice
  — once as text, once as `attr(data-text)` under `.overprint` in style.css.
  Change the heading and the attribute follows, or the ghost layer would keep
  saying the old word.
- **Words, not markup.** Adding a paragraph, changing a class or deleting an
  element is still a job for the HTML. Emptying a block deletes its words, and
  that is as structural as it gets.

`fuguesplit/index.html` is left out: a generated score viewer with thirteen
thousand runs of text in it, none of them site copy. The project captions and
case write-ups are not in here either — they already live in one file each,
`shared/script.js` and `case/cases.js`.

## refresh_titles.py

The only thing that touches the network, and only when new problems have
appeared upstream. It writes the two lookups that turn a problem *number* into
a title:

| file | contents |
| --- | --- |
| `lc_titles.json` | `{"1": ["Two Sum", "two-sum", 1], ...}` — title, slug, difficulty |
| `pe_titles.json` | `{"1": "Multiples of 3 or 5", ...}` |

```sh
python refresh_titles.py            # both
python refresh_titles.py euler      # one request, the whole index
```

That is deliberately all it collects. **Statements are not stored** — both
pages link out to projecteuler.net and leetcode.com instead. Embedding them
meant 13 MB of scraped HTML in the repo that went stale the moment either site
edited a problem, and the link is both smaller and always right.

**Project Euler answers are not collected, stored or shown anywhere.** Project
Euler asks that solutions are not published, and a page that hands you the
number is not one worth visiting twice.
