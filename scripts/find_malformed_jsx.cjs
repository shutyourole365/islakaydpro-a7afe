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

function snippetAround(text, idx, len = 120) {
  const start = Math.max(0, idx - Math.floor(len/2));
  const end = Math.min(text.length, start + len);
  return text.slice(start, end).replace(/\n/g, ' ');
}

const repoRoot = process.cwd();
const srcDir = path.join(repoRoot, 'src');
const outFile = process.argv[2] || path.join(repoRoot, 'results', 'malformed-jsx-report.json');

if (!fs.existsSync(srcDir)) {
  console.error('src directory not found');
  process.exit(2);
}

const patterns = [
  { name: 'onClick_missing_arrow', re: /onClick=\{\s*\)\s*=|onClick=\{\s*=/g },
  { name: 'onClick_literal_malformed', re: /onClick=\{[^}]*aria-label=\"/g },
  { name: 'aria_inside_braces', re: /\{[^}]*aria-label=\"/g },
  { name: 'arrow_followed_by_attr', re: /=>\s*aria-label/gi },
  { name: 'stray_gt_in_jsx', re: /\>\s*[a-zA-Z0-9_$]+\s*\(/g },
  { name: 'attribute_after_brace', re: /\}\s+aria-\w+=/g }
];

const files = walk(srcDir);
const report = {};
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    const matches = [];
    for (const p of patterns) {
      let m;
      while ((m = p.re.exec(txt)) !== null) {
        matches.push({ pattern: p.name, index: m.index, snippet: snippetAround(txt, m.index) });
        // avoid infinite loops for zero-length matches
        if (m.index === p.re.lastIndex) p.re.lastIndex++;
      }
      p.re.lastIndex = 0;
    }
    if (matches.length) report[path.relative(repoRoot, f)] = matches;
  } catch (err) {
    // ignore unreadable files
  }
}

// ensure results dir exists
const outDir = path.dirname(outFile);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), totalFilesScanned: files.length, matches: report }, null, 2));
console.log('Diagnostic scan complete. Results written to', outFile);
