const fs = require('fs');
const path = require('path');
function walk(dir){const res=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;}
const files = walk(path.join(process.cwd(),'src'));
const patched = [];
const variants = [
  'onClick={() = aria-label="Icon button">',
  "onClick={() = aria-label='Icon button'>",
  'onClick={() = aria-label="Icon button"> ',
  "onClick={() = aria-label='Icon button'> ",
  'onClick={() = aria-label="Icon button">\n',
  "onClick={() = aria-label='Icon button'>\n"
];
for(const f of files){
  let t = fs.readFileSync(f,'utf8'); const o = t;
  for(const v of variants) t = t.split(v).join('onClick={() => ');
  if(t !== o){ fs.writeFileSync(f + '.bak_bf', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); patched.push(path.relative(process.cwd(), f)); }
}
console.log('Bruteforce patched files:', patched.length);
if(patched.length) console.log(patched.join('\n'));
