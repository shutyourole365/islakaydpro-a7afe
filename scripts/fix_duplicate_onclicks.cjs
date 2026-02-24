#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, ext = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of list) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) {
      results.push(...walk(p, ext));
    } else if (ext.includes(path.extname(d.name))) {
      results.push(p);
    }
  }
  return results;
}

const repoRoot = process.cwd();
const files = walk(path.join(repoRoot, 'src'));
let patched = [];

for (const f of files) {
  try {
    let txt = fs.readFileSync(f, 'utf8');
    const orig = txt;

    // Pattern: onClick={() = "Icon button" onClick={() => ...
    txt = txt.replace(/onClick=\{\s*=\s*("[^"]*"|'[^']*')\s*onClick=\{\s*=>/g,
      (m, aria) => `aria-label=${aria} onClick={() =>`);

    // Fallback: onClick={() = "Icon button" (no duplicated onClick)
    txt = txt.replace(/onClick=\{\s*=\s*("[^"]*"|'[^']*')/g,
      (m, aria) => `aria-label=${aria} onClick={() =>`);

    // Handle onClick={) = aria-label="..."> pattern
    txt = txt.replace(/onClick=\{\s*\)\s*=\s*aria-label=("[^"]*"|'[^']*')/g,
      (m, aria) => `aria-label=${aria} onClick={() =>`);

    if (txt !== orig) {
      fs.writeFileSync(f + '.bak2', orig, 'utf8');
      fs.writeFileSync(f, txt, 'utf8');
      patched.push(path.relative(repoRoot, f));
    }
  } catch (err) {
    // ignore
  }
}

console.log('Duplicate onclick fixes applied to', patched.length, 'files');
if (patched.length) console.log(patched.join('\n'));
