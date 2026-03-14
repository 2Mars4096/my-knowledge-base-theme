#!/usr/bin/env python3
import os
import re
import datetime
import unicodedata
from pathlib import Path

def parse_bibtex_entries(bibtex_file):
    """Parse BibTeX entries from a file."""
    with open(bibtex_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split the content by entries (starting with @)
    entries = re.findall(r'@[^@]+', content, re.DOTALL)
    
    parsed_entries = []
    for entry in entries:
        # Extract the entry type and ID
        match = re.match(r'@(\w+){([^,]+),', entry)
        if not match:
            continue
        
        entry_type, entry_id = match.groups()
        
        # Extract fields
        fields = {}
        field_matches = re.finditer(r'(\w+)\s*=\s*{([^}]+)}', entry)
        for field_match in field_matches:
            field_name, field_value = field_match.groups()
            fields[field_name] = field_value
        
        parsed_entries.append({
            'type': entry_type,
            'id': entry_id,
            'fields': fields,
            'raw': entry.strip()
        })
    
    return parsed_entries

def replace_special_chars(text):
    """Replace LaTeX special characters with their Unicode equivalents."""
    # Common LaTeX special characters
    replacements = {
        r"{\'a}": "á", r"{\'e}": "é", r"{\'i}": "í", r"{\'o}": "ó", r"{\'u}": "ú",
        r"{\`a}": "à", r"{\`e}": "è", r"{\`i}": "ì", r"{\`o}": "ò", r"{\`u}": "ù",
        r"{\"a}": "ä", r"{\"e}": "ë", r"{\"i}": "ï", r"{\"o}": "ö", r"{\"u}": "ü",
        r"{\^a}": "â", r"{\^e}": "ê", r"{\^i}": "î", r"{\^o}": "ô", r"{\^u}": "û",
        r"{\~a}": "ã", r"{\~n}": "ñ", r"{\~o}": "õ",
        r"{\'A}": "Á", r"{\'E}": "É", r"{\'I}": "Í", r"{\'O}": "Ó", r"{\'U}": "Ú",
        r"{\`A}": "À", r"{\`E}": "È", r"{\`I}": "Ì", r"{\`O}": "Ò", r"{\`U}": "Ù",
        r"{\"A}": "Ä", r"{\"E}": "Ë", r"{\"I}": "Ï", r"{\"O}": "Ö", r"{\"U}": "Ü",
        r"{\^A}": "Â", r"{\^E}": "Ê", r"{\^I}": "Î", r"{\^O}": "Ô", r"{\^U}": "Û",
        r"{\~A}": "Ã", r"{\~N}": "Ñ", r"{\~O}": "Õ",
        r"{\c{c}}": "ç", r"{\c{C}}": "Ç",
        r"{\o}": "ø", r"{\O}": "Ø",
        r"{\aa}": "å", r"{\AA}": "Å",
        r"{\ae}": "æ", r"{\AE}": "Æ",
        r"{\ss}": "ß"
    }
    
    for latex, unicode_char in replacements.items():
        text = text.replace(latex, unicode_char)
    
    return text

def generate_index_md(entry, output_dir):
    """Generate index.md file for a BibTeX entry."""
    entry_id = entry['id']
    fields = entry['fields']
    
    # Create directory if it doesn't exist
    paper_dir = os.path.join(output_dir, entry_id)
    os.makedirs(paper_dir, exist_ok=True)
    
    # Process title and other fields
    title = replace_special_chars(fields.get('title', 'Untitled'))
    
    # Format the raw BibTeX entry with proper indentation
    raw_bibtex = entry['raw']
    indented_bibtex = '\n    '.join(raw_bibtex.split('\n'))
    
    # Generate content
    content = f"""---
title: "{title}"
subtitle: ""
date: {(datetime.datetime.now() - datetime.timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:%S')}
draft: false
description: ""
link: ""
pageID: "{entry_id}"
bibtex: >
    {indented_bibtex}
---

{{{{< paperPDF filename="" height="800px" >}}}}

## Takeaways


"""
    
    # Write to file
    with open(os.path.join(paper_dir, 'index.md'), 'w', encoding='utf-8') as f:
        f.write(content)
    
    return paper_dir

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    bibtex_file = os.path.join(script_dir, 'bibtex.txt')
    output_dir = os.path.join(project_dir, 'content', 'papers')
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Parse BibTeX entries
    entries = parse_bibtex_entries(bibtex_file)
    
    # Generate index.md files
    for entry in entries:
        paper_dir = generate_index_md(entry, output_dir)
        print(f"Generated index.md in {paper_dir}")

if __name__ == "__main__":
    main()
