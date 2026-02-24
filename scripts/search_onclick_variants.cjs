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

const files = walk(path.join(process.cwd(),'src'));
const matches = [];
for(const f of files){
  const t = fs.readFileSync(f,'utf8');
  if(t.includes('onClick={() = "') || t.includes("onClick={() = '") || t.includes('onClick={() = aria-label') || t.includes('onClick={() = "Icon button"')){
    matches.push(f);
  }
}
if(!fs.existsSync('results')) fs.mkdirSync('results');
fs.writeFileSync('results/onclick-variants.json', JSON.stringify({found: matches.length, files: matches}, null, 2));
console.log('Wrote results/onclick-variants.json');
