const fs = require('fs');
const path = require('path');
function walk(dir){const res=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;}
const files = walk(path.join(process.cwd(),'src'));
const patched=[];
for(const f of files){
  let t = fs.readFileSync(f,'utf8'); const o=t;
  t = t.replace(/onClick=\{\s*=>\s*onClick=\{\s*=>/g, 'onClick={() =>');
  t = t.replace(/onClick=\{\s*=>\s*onClick=\(/g, 'onClick={() =>(');
  t = t.replace(/\}`aria-label=/g, '} aria-label=');
  t = t.replace(/\}aria-label=/g, '} aria-label=');
  // collapse double onClick sequences: onClick={() => onClick(() => -> onClick={() =>
  t = t.replace(/onClick=\{\s*\(\)\s*=>\s*onClick=\{\s*\(\)\s*=>/g, 'onClick={() =>');
  if(t!==o){ fs.writeFileSync(f + '.bak5', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); patched.push(path.relative(process.cwd(), f)); }
}
console.log('Nested/spaces fixes applied to', patched.length, 'files');
if(patched.length) console.log(patched.join('\n'));
