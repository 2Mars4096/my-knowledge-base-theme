# Scripts

Utility scripts for managing the knowledge base.

## export_bib.py

Extract BibTeX entries from paper frontmatter into `.bib` files.

```bash
# Export all papers
python scripts/export_bib.py

# Cherry-pick specific papers
python scripts/export_bib.py --ids "smith2024widgets,doe2023logistics"

# Filter by tags
python scripts/export_bib.py --tags "networks,supply-chain"

# Extract only papers cited in a LaTeX manuscript
python scripts/export_bib.py --from-tex ~/Projects/my-paper/main.tex

# Custom output path
python scripts/export_bib.py --out ~/Projects/my-paper/references.bib

# List all available paper IDs
python scripts/export_bib.py --list
```

No external dependencies — pure Python 3.

## migrate_pdfs.py

One-shot migration script (already run). Renamed PDFs to BibTeX IDs, updated shortcodes, and moved orphan PDFs.

## Multiple Versions Convention

When a paper has multiple versions (working paper, R&R, published):

- `bibtexid.pdf` — always the latest/canonical version (displayed by the shortcode)
- `bibtexid_wp.pdf` — working paper version
- `bibtexid_v1.pdf` — earlier revision
- `bibtexid_r1.pdf` — R&R round 1

Only one `content/papers/bibtexid/` entry per paper. Old versions are accessible at `/papers/bibtexid_wp.pdf` but not embedded in the page.
