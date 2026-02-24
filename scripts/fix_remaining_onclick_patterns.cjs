const fs = require('fs');
const path = require('path');
function walk(dir){const res=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;}
const files = walk(path.join(process.cwd(),'src'));
const patched = [];
const patterns = [
  /onClick=\{\s*=\s*aria-label=("[^"]*"|'[^']*')\s*>/g,
  /onClick=\{\s*\)\s*=\s*aria-label=("[^"]*"|'[^']*')\s*>/g,
  /onClick=\{\s*=\s*("Icon button"|'Icon button')/g,
  /onClick=\{\s*=\s*aria-label=("[^"]*"|'[^']*')/g,
  /onClick=\{\s*=\s*([^\s\}]+)\s*onClick=\{/g
];

for(const f of files){
  try{
    let t = fs.readFileSync(f,'utf8'); const o = t;
    // multiple passes
    t = t.replace(/onClick=\{\s*=\s*aria-label=("[^"]*"|'[^']*')\s*>\s*/g, (m, a) => `${a} onClick={() => `);
    t = t.replace(/onClick=\{\s*\)\s*=\s*aria-label=("[^"]*"|'[^']*')\s*>\s*/g, (m, a) => `${a} onClick={() => `);
    t = t.replace(/onClick=\{\s*=\s*("Icon button"|'Icon button')/g, (m, a) => `aria-label=${a} onClick={() =>`);
    t = t.replace(/onClick=\{\s*=\s*aria-label=("[^"]*"|'[^']*')/g, (m, a) => `aria-label=${a} onClick={() =>`);
    t = t.replace(/onClick=\{\s*=\s*([^\s\}]+)\s*onClick=\{/g, (m, a) => `aria-label=${a} onClick={`);

    if(t !== o){ fs.writeFileSync(f + '.bak_final', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); patched.push(path.relative(process.cwd(), f)); }
  }catch(e){ }
}
console.log('Remaining onclick patterns fixed in', patched.length, 'files');
if(patched.length) console.log(patched.join('\n'));
