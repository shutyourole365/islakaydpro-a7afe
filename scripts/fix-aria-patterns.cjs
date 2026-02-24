/**
 * Auto-fix all known malformed JSX patterns introduced by accessibility automation.
 * Patterns fixed:
 * 1. `aria-label="Icon button"> {` broken onClick callbacks
 * 2. `onClick={(e) = aria-label="Icon button"> {` broken callbacks
 * 3. `} aria-label="Icon button">` inside className template literals
 * 4. `/ aria-label="...">;` broken self-closing tags
 * 5. `aria-label="Icon button" onClick={...}` standalone (OK but redundant label)
 * 6. className template ending with `} aria-label="Icon button">`
 */
const fs = require('fs');
const path = require('path');
// No glob needed - using recursive fs walk

// Recursively find all .tsx files
function findTsxFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findTsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) && !entry.name.endsWith('.bak')) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = findTsxFiles(srcDir);

let totalFixes = 0;
let filesFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Pattern 1: `aria-label="Icon button"> {` as broken onClick — the button has 
  // aria-label="Icon button"> followed by a JS block that should be onClick={() => { ... }}
  // e.g.: `aria-label="Icon button"> {\n  someAction();\n  }}` 
  // Replace: `aria-label="Icon button"> expr}` with `onClick={() => expr}>`
  // This is the trickiest pattern. It appears as:
  //   aria-label="Icon button"> someExpr}
  // which should be:
  //   onClick={() => someExpr}>
  
  // Pattern 2: `onClick={(e) = aria-label="Icon button"> {` 
  // Should be: `aria-label="Icon button" onClick={(e) => {`
  content = content.replace(
    /onClick=\{(\(e?\))\s*=\s*aria-label="Icon button">\s*\{/g,
    'aria-label="Icon button"\n                    onClick={$1 => {'
  );
  
  // Pattern 3: `aria-label="Icon button"> {` as start of inline block (not onClick)
  // These look like: `\n            aria-label="Icon button"> {\n              expr;\n            }}`
  // Should be: `onClick={() => {\n              expr;\n            }}`
  content = content.replace(
    /aria-label="Icon button">\s*\{(\s*\n)/g,
    'aria-label="Icon button"\n                    onClick={() => {$1'
  );
  
  // Pattern 4: Standalone `aria-label="Icon button"> expr}` on single line
  // e.g. `aria-label="Icon button"> onCalculate?.(estimate)}`
  content = content.replace(
    /aria-label="Icon button">\s+([^{}\n]+)\}/g,
    (match, expr) => {
      const trimmed = expr.trim();
      if (trimmed.startsWith('<') || trimmed.startsWith('//')) return match; // Skip JSX/comments
      return `aria-label="Icon button"\n                    onClick={() => ${trimmed}}`;
    }
  );
  
  // Pattern 5: `} aria-label="Icon button">` inside className template literal
  // e.g. `${className} aria-label="Icon button">`
  // Should be: `${className}`}\n          aria-label="Icon button"\n          >` 
  content = content.replace(
    /\}\s*aria-label="Icon button">/g,
    '}`}\n            aria-label="Icon button"\n          >'
  );
  
  // Pattern 6: `/ aria-label="xyz">` broken self-closing tags
  // Should be: `/>`
  content = content.replace(
    /\/\s*aria-label="[^"]*">/g,
    '/>'
  );
  
  // Pattern 7: Duplicate `aria-label` attributes on same element — keep first
  // `aria-label="Icon button" onClick={...}` where there's already an aria-label
  // Just remove the "Icon button" one if redundant
  content = content.replace(
    /aria-label="Icon button"\s+(onClick)/g,
    '$1'
  );
  
  // Pattern 8: Trailing ` aria-label="Icon button">` at end of className string (not template)
  // e.g. `className="... aria-label="Icon button">`
  // NOTE: This is inside a regular string, making className break. Fix:
  content = content.replace(
    /className="([^"]*?)\s*aria-label="Icon button">/g,
    'className="$1"\n            aria-label="Icon button"\n          >'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    const changes = content.split('\n').length - original.split('\n').length;
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`Fixed: ${relPath} (${Math.abs(changes)} line changes)`);
    filesFixed++;
    totalFixes++;
  }
}

console.log(`\nDone. Fixed ${filesFixed} files with ${totalFixes} total file modifications.`);
