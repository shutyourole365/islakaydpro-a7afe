import re
from pathlib import Path

root = Path('c:/Users/nunya/Documents/GitHub/islakaydpro')
workflow_dir = root / '.github' / 'workflows'
files = list(workflow_dir.glob('**/*.[yY][mM][lL]')) + list(workflow_dir.glob('**/*.[yY][aA][mM][lL]'))
if not files:
    print('No workflow YAML files found under .github/workflows')
    raise SystemExit(0)

for f in files:
    txt = f.read_text(encoding='utf-8')
    # Normalize CRLF to LF
    txt = txt.replace('\r\n', '\n').replace('\r', '\n')
    # Ensure document start
    if not txt.lstrip().startswith('---'):
        txt = '---\n' + txt.lstrip('\n')
    # Trim trailing spaces on each line
    lines = [line.rstrip() for line in txt.split('\n')]
    txt = '\n'.join(lines)
    # Remove spaces immediately after '[' and before ']'
    txt = re.sub(r"\[\s+", "[", txt)
    txt = re.sub(r"\s+\]", "]", txt)
    # Quote 'on' key to avoid truthy warnings (only top-level key)
    txt = re.sub(r'^on:\n', '"on":\n', txt, flags=re.M)
    # Ensure file ends with single newline
    if not txt.endswith('\n'):
        txt += '\n'
    # write as bytes to avoid platform newline translation (CRLF)
    f.write_bytes(txt.encode('utf-8'))
    print('fixed', f)
print('done')
