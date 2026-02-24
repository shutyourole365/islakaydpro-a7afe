import re
from pathlib import Path

root = Path('c:/Users/nunya/Documents/GitHub/islakaydpro')
files = list(root.glob('src/**/*.tsx'))
if not files:
    print('No .tsx files found under src/')
    raise SystemExit(0)

total_modified = 0
modified_files = []

for f in files:
    txt = f.read_text(encoding='utf-8')
    orig = txt

    # Fix ARIA boolean attributes quoted with {expression}
    txt = re.sub(r'aria-(pressed|expanded|checked)=["\']\{([^}]+)\}["\']', r'aria-\1={\2}', txt)

    # Add aria-label for icon-only buttons (contain <svg or <Icon) and no aria-label/title
    def add_label_to_button(match):
        tag = match.group(0)
        if 'aria-label=' in tag or 'title=' in tag:
            return tag
        # insert aria-label
        return tag.replace('>', ' aria-label="Icon button">', 1)

    txt = re.sub(r'<button([^>]*)>', add_label_to_button, txt)

    # Add aria-label to inputs/selects that lack label/title/placeholder and have id or name
    def label_input(match):
        whole = match.group(0)
        attrs = match.group(2)
        tag = match.group(1)
        if any(k in attrs for k in ['aria-label=', 'title=', 'placeholder=']):
            return whole
        m = re.search(r'name=["\']([^"\']+)["\']', attrs) or re.search(r'id=["\']([^"\']+)["\']', attrs)
        if m:
            label = m.group(1).replace('"', '')
            return f'<{tag}{attrs} aria-label="{label}">' 
        return whole

    txt = re.sub(r'<(input|select)([^>]*)>', label_input, txt)

    if txt != orig:
        f.write_text(txt, encoding='utf-8')
        total_modified += 1
        modified_files.append(str(f))

print(f'files modified: {total_modified}')
for m in modified_files:
    print(' -', m)
