import subprocess
from pathlib import Path

root = Path('c:/Users/nunya/Documents/GitHub/islakaydpro')
workflow_dir = root / '.github' / 'workflows'
files = list(workflow_dir.glob('**/*.[yY][mM][lL]')) + list(workflow_dir.glob('**/*.[yY][aA][mM][lL]'))
if not files:
    print('No workflow YAML files found under .github/workflows')
    raise SystemExit(0)

exit_code = 0
for f in files:
    print('\n--- Linting', f, '---')
    try:
        # run yamllint via module to avoid PATH issues
        proc = subprocess.run(['python', '-m', 'yamllint', str(f)], capture_output=True, text=True)
        if proc.returncode != 0:
            exit_code = 1
        print(proc.stdout)
        if proc.stderr:
            print(proc.stderr)
    except Exception as e:
        print('ERROR running yamllint on', f, e)
        exit_code = 2

raise SystemExit(exit_code)
