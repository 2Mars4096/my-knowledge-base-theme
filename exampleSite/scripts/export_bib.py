#!/usr/bin/env python3
"""
export_bib.py — Extract BibTeX entries from paper frontmatter.

Usage:
    python scripts/export_bib.py                               # all papers → references.bib
    python scripts/export_bib.py --ids "id1,id2,id3"           # cherry-pick by BibTeX ID
    python scripts/export_bib.py --tags "networks,supply-chain" # filter by tags
    python scripts/export_bib.py --from-tex path/to/main.tex   # extract cited keys from .tex
    python scripts/export_bib.py --out path/to/output.bib      # custom output path
    python scripts/export_bib.py --list                        # list all available IDs
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS_DIR = ROOT / "content" / "papers"


def parse_frontmatter(md_path: Path) -> dict:
    """Parse YAML frontmatter from a markdown file. Returns dict with raw strings."""
    text = md_path.read_text(encoding="utf-8")
    # Match content between first pair of ---
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    fm_text = m.group(1)

    result = {}

    # Extract pageID
    pid = re.search(r'^pageID:\s*"?([^"\n]+)"?', fm_text, re.MULTILINE)
    if pid:
        result["pageID"] = pid.group(1).strip()

    # Extract tags
    tags_match = re.search(r"^tags:\s*\[([^\]]*)\]", fm_text, re.MULTILINE)
    if tags_match:
        raw = tags_match.group(1)
        result["tags"] = [t.strip().strip("\"'") for t in raw.split(",") if t.strip()]
    else:
        result["tags"] = []

    # Extract bibtex — handle both block scalar (>) and inline string
    # Block scalar: bibtex: > or bibtex: >\n    @article{...}
    bib_block = re.search(
        r"^bibtex:\s*>-?\s*\n((?:[ \t]+.*\n?)*)", fm_text, re.MULTILINE
    )
    if bib_block:
        bib_text = bib_block.group(1)
        # Remove common leading whitespace
        lines = bib_text.splitlines()
        result["bibtex"] = "\n".join(line.strip() for line in lines if line.strip())
    else:
        # Inline: bibtex: "@article{...}"
        bib_inline = re.search(r'^bibtex:\s*"(.*?)"', fm_text, re.MULTILINE | re.DOTALL)
        if bib_inline:
            result["bibtex"] = bib_inline.group(1).strip()

    return result


def load_all_papers() -> list[dict]:
    """Load metadata for all papers."""
    papers = []
    for paper_dir in sorted(PAPERS_DIR.iterdir()):
        if not paper_dir.is_dir():
            continue
        index_md = paper_dir / "index.md"
        if not index_md.exists():
            continue
        fm = parse_frontmatter(index_md)
        fm["dir_name"] = paper_dir.name
        papers.append(fm)
    return papers


def extract_cite_keys_from_tex(tex_path: Path) -> set[str]:
    """Extract all \\cite{...} keys from a .tex file."""
    text = tex_path.read_text(encoding="utf-8")
    # Match \cite{key1,key2}, \citet{key}, \citep{key}, \citeauthor{key}, etc.
    matches = re.findall(r"\\cite[tp]?\*?\{([^}]+)\}", text)
    keys = set()
    for m in matches:
        for key in m.split(","):
            keys.add(key.strip())
    return keys


def main():
    parser = argparse.ArgumentParser(description="Export BibTeX from paper frontmatter")
    parser.add_argument("--ids", help="Comma-separated BibTeX IDs to include")
    parser.add_argument("--tags", help="Comma-separated tags to filter by (OR logic)")
    parser.add_argument("--from-tex", help="Path to .tex file; extract cited keys")
    parser.add_argument("--out", default="references.bib", help="Output .bib file path")
    parser.add_argument("--list", action="store_true", help="List all available paper IDs")
    args = parser.parse_args()

    papers = load_all_papers()

    if args.list:
        for p in papers:
            pid = p.get("pageID", p["dir_name"])
            tags = ", ".join(p.get("tags", []))
            tag_str = f"  [{tags}]" if tags else ""
            print(f"  {pid}{tag_str}")
        print(f"\nTotal: {len(papers)} papers")
        return

    # Determine which IDs to include
    filter_ids = None
    if args.ids:
        filter_ids = {k.strip() for k in args.ids.split(",")}
    elif args.from_tex:
        tex_path = Path(args.from_tex)
        if not tex_path.exists():
            print(f"Error: {tex_path} not found", file=sys.stderr)
            sys.exit(1)
        filter_ids = extract_cite_keys_from_tex(tex_path)
        print(f"Found {len(filter_ids)} citation keys in {tex_path}")

    filter_tags = None
    if args.tags:
        filter_tags = {t.strip() for t in args.tags.split(",")}

    # Filter and collect BibTeX entries
    entries = []
    for p in papers:
        pid = p.get("pageID", p["dir_name"])
        bib = p.get("bibtex", "")
        if not bib:
            continue

        # ID filter
        if filter_ids and pid not in filter_ids:
            continue

        # Tag filter (OR logic: include if paper has ANY of the filter tags)
        if filter_tags:
            paper_tags = set(p.get("tags", []))
            if not paper_tags.intersection(filter_tags):
                continue

        entries.append(bib)

    if not entries:
        print("No matching BibTeX entries found.", file=sys.stderr)
        sys.exit(1)

    output = "\n\n".join(entries) + "\n"
    out_path = Path(args.out)
    out_path.write_text(output, encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {out_path}")


if __name__ == "__main__":
    main()
