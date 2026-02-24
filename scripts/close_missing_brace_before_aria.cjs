const fs = require('fs');
const path = require('path');
function walk(dir){const res=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;}
const files = walk(path.join(process.cwd(),'src'));
const patched = [];
const re = /(aria-[a-z-]+=)\{([^}\n]*?)\s(aria-[a-z-]+=)/gi;
for(const f of files){
  let t = fs.readFileSync(f,'utf8'); const o=t;
  t = t.replace(re, (m, a1, inner, a2) => `${a1}{${inner}} ${a2}`);
  if(t !== o){ fs.writeFileSync(f + '.bak7', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); patched.push(path.relative(process.cwd(), f)); }
}
console.log('Closed missing braces before aria- in', patched.length, 'files');
if(patched.length) console.log(patched.join('\n'));
