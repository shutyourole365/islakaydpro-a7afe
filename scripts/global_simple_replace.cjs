const fs = require('fs');
const path = require('path');

function walk(dir){
  const res=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;
}

const files = walk(path.join(process.cwd(),'src'));
let changed = [];
for(const f of files){
  let t = fs.readFileSync(f,'utf8');
  const o = t;
  t = t.split('onClick={() = "Icon button"').join('aria-label="Icon button" onClick={() =>');
  t = t.split("onClick={() = 'Icon button'").join("aria-label='Icon button' onClick={() =>");
  t = t.split('onClick={() = aria-label="').join('aria-label="');
  t = t.split("onClick={() = aria-label='").join("aria-label='");
  if(t !== o){ fs.writeFileSync(f + '.bak_simple', o, 'utf8'); fs.writeFileSync(f, t, 'utf8'); changed.push(path.relative(process.cwd(), f)); }
}
console.log('Applied simple replacements to', changed.length, 'files');
if(changed.length) console.log(changed.join('\n'));
