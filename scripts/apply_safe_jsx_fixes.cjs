#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const reportPath = process.argv[2] || path.join(repoRoot, 'results', 'malformed-jsx-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('Report file not found:', reportPath);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const filesFromReport = Object.keys(report.matches || {});

function walk(dir, ext = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of list) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) {
      results.push(...walk(p, ext));
    } else if (ext.includes(path.extname(d.name))) {
      results.push(path.relative(repoRoot, p));
    }
  }
  return results;
}

const files = filesFromReport.length ? filesFromReport : walk(path.join(repoRoot, 'src'));

function applyTransforms(txt) {
  let orig = txt;

  // 1) simple fix: restore missing arrow where pattern onClick={() = -> onClick={() =>
  txt = txt.replace(/onClick=\{\s*=/g, 'onClick={() =>');
  txt = txt.replace(/onClick=\{\s*\)\s*=/g, 'onClick={() =>');

  // 2) move aria-label if it was injected inside braces before the onClick body
  // e.g. onClick={() = aria-label="Icon button"> setX()} -> aria-label="Icon button" onClick={() => setX()}
  txt = txt.replace(/onClick=\{\s*=?\s*aria-label=("[^"]*"|'[^']*')\s*>\s*([\s\S]*?)\}/g,
    (m, aria, body) => {
      // body may include trailing ) or ); remove trailing > if any
      return `${aria} onClick={() => ${body}}`;
    }
  );

  // 3) If aria-label appears followed by > and then a call expression ending with }) or )}
  txt = txt.replace(/aria-label=("[^"]*"|'[^']*')\s*>\s*([a-zA-Z0-9_.$]+\([^\)]*\))\s*\}/g,
    (m, aria, fn) => `${aria} onClick={() => ${fn}}`);

  // 4) clean up accidental "} aria-..." patterns: replace "}\s+aria-..." with aria before onClick
  txt = txt.replace(/\}\s+(aria-[a-zA-Z0-9-]+=)/g, (m, attr) => `${attr}`);

  // 5) Fix duplicated/mangled sequences like: onClick={() = "Icon button" onClick={() => ...
  txt = txt.replace(/onClick=\{\s*=\s*("[^"]*"|'[^']*')\s*onClick=\{\s*=>/g,
    (m, aria) => `aria-label=${aria} onClick={() =>`);

  // 6) If any lingering pattern like `onClick={() = "Icon button"` (no duplicated onClick), convert to aria + fix arrow
  txt = txt.replace(/onClick=\{\s*=\s*("[^"]*"|'[^']*')/g, (m, aria) => `aria-label=${aria} onClick={() =>`);

  return txt === orig ? null : txt;
}

const changed = [];
for (const rel of files) {
  const abs = path.join(repoRoot, rel);
  try {
    const txt = fs.readFileSync(abs, 'utf8');
    const out = applyTransforms(txt);
    if (out !== null) {
      // backup
      fs.writeFileSync(abs + '.bak', txt, 'utf8');
      fs.writeFileSync(abs, out, 'utf8');
      changed.push(rel);
      console.log('Patched', rel);
    }
  } catch (err) {
    console.error('Failed to process', rel, err.message);
  }
}

console.log('Finished. Files patched:', changed.length);
if (changed.length) console.log(changed.join('\n'));
