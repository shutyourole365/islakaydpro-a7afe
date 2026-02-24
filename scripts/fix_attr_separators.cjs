const fs = require('fs');
const path = require('path');
function walk(dir){const res=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;}
const files = walk(path.join(process.cwd(),'src'));
const patched = [];
for(const f of files){
  let t = fs.readFileSync(f,'utf8'); const o = t;
  t = t.replace(/\}`aria-/g, '} aria-');
  t = t.replace(/([`"\)\}\w\d])aria-/g, (m, p1) => `${p1} aria-`);
  // If a number is directly before aria-, add a closing brace before the space (heuristic)
  t = t.replace(/(\d) aria-/g, (m, d) => `${d}} aria-`);
  if(t !== o){ fs.writeFileSync(f + '.bak6', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); patched.push(path.relative(process.cwd(), f)); }
}
console.log('Attr separator fixes applied to', patched.length, 'files');
if(patched.length) console.log(patched.join('\n'));
