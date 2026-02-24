#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir){
  const res = [];
  for(const e of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, e.name);
    if(e.isDirectory()) res.push(...walk(p));
    else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);
  }
  return res;
}

const repo = process.cwd();
const files = walk(path.join(repo, 'src'));
const patched = [];

for(const f of files){
  try{
    let t = fs.readFileSync(f, 'utf8');
    const o = t;

    // 1) Remove stray backticks immediately before attributes: `aria- -> aria-
    t = t.replace(/`\s*(aria-[a-zA-Z-]+=)/g, '$1');
    t = t.replace(/`(aria-[a-zA-Z-]+=)/g, '$1');

    // 2) Insert missing closing brace + space before next aria- when value seems unclosed
    // e.g. aria-valuenow={valuearia-valuemin={0} -> aria-valuenow={value} aria-valuemin={0}
    t = t.replace(/(aria-[a-zA-Z-]+=\{[^}\n]+?)\s+(aria-[a-zA-Z-]+=)/g, (m, a, b) => {
      return a + '} ' + b;
    });

    // 3) Also handle cases where numeric or identifier is immediately followed by aria- without a brace
    t = t.replace(/(\}?)\s*([0-9A-Za-z_\)\]])(aria-[a-zA-Z-]+=)/g, (m, brace, prev, attr) => {
      if (brace) return `${brace} ${prev}${attr}`; // already has brace
      return `${prev} } ${attr}`; // insert closing brace heuristically
    });

    // 4) Fix nested duplicated onClick wrappers: onClick={() => onClick={() => ... }} -> onClick={() => ... }
    t = t.replace(/onClick=\{\s*\(\)\s*=>\s*onClick=\{\s*\(\)\s*=>/g, 'onClick={() =>');
    t = t.replace(/onClick=\{\s*=>\s*onClick=\{\s*=>/g, 'onClick={() =>');
    t = t.replace(/onClick=\{\s*\(\)\s*=>\s*onClick=\{\s*=>/g, 'onClick={() =>');

    // 5) Collapse patterns like onClick={() => onClick(() => foo())} -> onClick={() => foo()}
    t = t.replace(/onClick=\{\s*\(\)\s*=>\s*onClick=\(\s*\)\s*=>\s*([\s\S]*?)\}/g, (m, body) => `onClick={() => ${body}}`);

    // 6) Fix common concatenation: `}aria-` -> `} aria-`
    t = t.replace(/\}aria-/g, '} aria-');

    if(t !== o){
      fs.writeFileSync(f + '.bak_adv', o, 'utf8');
      fs.writeFileSync(f, t, 'utf8');
      patched.push(path.relative(repo, f));
    }
  }catch(e){
    // ignore unreadable
  }
}

console.log('Advanced cleanup applied to', patched.length, 'files');
if(patched.length) console.log(patched.join('\n'));
