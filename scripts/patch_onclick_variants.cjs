const fs = require('fs');
const path = require('path');

const reportPath = path.join(process.cwd(), 'results', 'onclick-variants.json');
if (!fs.existsSync(reportPath)) {
  console.error('Report not found:', reportPath);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const files = report.files || [];
const patched = [];

for (const abs of files) {
  try {
    let txt = fs.readFileSync(abs, 'utf8');
    const orig = txt;

    // 1) duplicated pattern: onClick={() = "Icon button" onClick={() =>
    txt = txt.replace(/onClick=\{\s*=\s*("([^"]*)"|'([^']*)')\s*onClick=\{\s*=>/g,
      (m, aria) => `aria-label=${aria} onClick={() =>`);

    // 2) fallback single: onClick={() = "Icon button"
    txt = txt.replace(/onClick=\{\s*=\s*("([^"]*)"|'([^']*)')/g,
      (m, aria) => `aria-label=${aria} onClick={() =>`);

    // 3) onClick={) = aria-label="..."> fn()}
    txt = txt.replace(/onClick=\{\s*\)\s*=\s*aria-label=("[^"]*"|'[^']*')\s*>\s*([\s\S]*?)\}/g,
      (m, aria, body) => `${aria} onClick={() => ${body}}`);

    // 4) clean up leftover sequences like `}aria-label=` -> ` aria-label=` (add space)
    txt = txt.replace(/\}aria-label=/g, '} aria-label=');

    if (txt !== orig) {
      fs.writeFileSync(abs + '.bak3', orig, 'utf8');
      fs.writeFileSync(abs, txt, 'utf8');
      patched.push(path.relative(process.cwd(), abs));
    }
  } catch (err) {
    console.error('err', abs, err.message);
  }
}

console.log('Patched files:', patched.length);
if (patched.length) console.log(patched.join('\n'));
