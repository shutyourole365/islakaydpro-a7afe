from pathlib import Path
p=Path('c:/Users/nunya/Documents/GitHub/islakaydpro/.github/workflows/codeql.yml')
b=p.read_bytes()
nb=b.replace(b'\r\n',b'\n')
if nb!=b:
    p.write_bytes(nb)
    print('normalized')
else:
    print('already-lf')
