/**
 * Precise auto-fix for malformed JSX patterns.
 * This script targets specific line-level patterns and applies contextual fixes.
 */
const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findFiles(p));
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith('.bak')) {
      results.push(p);
    }
  }
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);
let totalFixed = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf-8');
  const lines = original.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Pattern A: `onClick={(e) = aria-label="Icon button"> {`
    // Fix: split into aria-label prop + proper onClick
    if (/onClick=\{.*=\s*aria-label="[^"]*">\s*\{/.test(line)) {
      const indent = line.match(/^\s*/)[0];
      const paramMatch = line.match(/onClick=\{(\([^)]*\))\s*=\s*aria-label="([^"]*)">\s*\{/);
      if (paramMatch) {
        lines[i] = `${indent}aria-label="${paramMatch[2]}"`;
        // Insert onClick on next line
        lines.splice(i + 1, 0, `${indent}onClick={${paramMatch[1]} => {`);
        changed = true;
        i++; // skip inserted line
      }
      continue;
    }
    
    // Pattern B: `aria-label="Icon button"> exprOnSingleLine}`
    // Where the line has an onClick-like expression ending with }
    // e.g. `aria-label="Icon button"> setFoo(bar)}` 
    // Fix: onClick={() => setFoo(bar)}
    const patB = line.match(/^(\s*)aria-label="([^"]*)">\s*([^{}<>]+)\}\s*$/);
    if (patB && !patB[3].includes('//') && !patB[3].includes('/*')) {
      const [, indent, label, expr] = patB;
      lines[i] = `${indent}aria-label="${label}"`;
      lines.splice(i + 1, 0, `${indent}onClick={() => ${expr.trim()}}`);
      changed = true;
      i++;
      continue;
    }
    
    // Pattern C: `aria-label="Icon button"> {` (start of multi-line block)
    // Check if next lines form a callback body ending with `}}`
    if (/^\s*aria-label="[^"]*">\s*\{\s*$/.test(line)) {
      const indent = line.match(/^\s*/)[0];
      const labelMatch = line.match(/aria-label="([^"]*)"/);
      if (labelMatch) {
        lines[i] = `${indent}aria-label="${labelMatch[1]}"`;
        lines.splice(i + 1, 0, `${indent}onClick={() => {`);
        changed = true;
        i++;
      }
      continue;
    }
    
    // Pattern D: `} aria-label="Icon button">` inside className template literal
    // The line should look like: `} aria-label="Icon button">`  
    // and the PREVIOUS line(s) should have `className={` with a template literal
    // Fix: close template with `}`} then add aria-label and > as separate props
    if (/\}\s*aria-label="[^"]*"\s*>/.test(line)) {
      // Check if this is inside a className template literal context
      // Look backwards for an unclosed className={` 
      let inTemplate = false;
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        if (/className=\{`/.test(lines[j])) {
          inTemplate = true;
          break;
        }
        if (/`\}/.test(lines[j]) && j !== i) break; // found closing already
      }
      
      if (inTemplate) {
        const indent = line.match(/^\s*/)[0];
        const labelMatch = line.match(/aria-label="([^"]*)"/);
        const label = labelMatch ? labelMatch[1] : 'Button';
        lines[i] = `${indent}}\`}`;
        lines.splice(i + 1, 0, `${indent}aria-label="${label}"`);
        lines.splice(i + 2, 0, `${indent}>`);
        changed = true;
        i += 2;
        continue;
      }
    }
    
    // Pattern E: `/ aria-label="xxx">` broken self-closing tags
    if (/\/\s*aria-label="[^"]*"\s*>/.test(line)) {
      lines[i] = line.replace(/\/\s*aria-label="[^"]*"\s*>/, '/>');
      changed = true;
      continue;
    }
    
    // Pattern F: className="..." with aria-label="Icon button"> at end (non-template)
    if (/className="[^"]*\s+aria-label="[^"]*"\s*>/.test(line)) {
      const indent = line.match(/^\s*/)[0];
      const match = line.match(/(className="[^"]*?)\s+aria-label="([^"]*)"\s*>/);
      if (match) {
        lines[i] = `${indent}${match[1]}"`;
        lines.splice(i + 1, 0, `${indent}aria-label="${match[2]}"`);
        lines.splice(i + 2, 0, `${indent}>`);
        changed = true;
        i += 2;
      }
      continue;
    }
    
    // Pattern G: Standalone `aria-label="Icon button" onClick={...}` — OK as-is but remove redundant label
    // Leave as is for now
    
    // Pattern H: ` aria-label="Icon button">` at end of non-template className line
    // e.g. `className="foo bar" aria-label="Icon button">`
    // Already handled by Pattern F
    
    // Pattern I: ` aria-label="Icon button">` on its own line (trailing >)
    // This is a stray attribute that got separated
    if (/^\s*aria-label="Icon button"\s*>\s*$/.test(line)) {
      // Check previous line for context
      const prevLine = i > 0 ? lines[i-1] : '';
      if (/className=/.test(prevLine) || /transition-/.test(prevLine) || /rounded-/.test(prevLine)) {
        const indent = line.match(/^\s*/)[0];
        lines[i] = `${indent}>`;
        changed = true;
      }
      continue;
    }
  }
  
  if (changed) {
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    const rel = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`Fixed: ${rel}`);
    totalFixed++;
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
