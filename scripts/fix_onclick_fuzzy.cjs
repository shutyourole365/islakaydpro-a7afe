const fs = require('fs');
const path = require('path');

function walk(dir){
  const res=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) res.push(...walk(p)); else if(['.ts','.tsx','.js','.jsx'].includes(path.extname(e.name))) res.push(p);} return res;
}

const files = walk(path.join(process.cwd(),'src'));
const patched = [];

for(const f of files){
  let txt = fs.readFileSync(f,'utf8');
  const orig = txt;
  // fuzzy pattern: from onClick={ =  up to the next onClick={ occurrence
  const re = /onClick=\{\s*=\s*([\s\S]*?)onClick=\{/g;
  txt = txt.replace(re, (m, mid) => {
    // try to extract aria-label value
    const ariaMatch = mid.match(/aria-label=("[^"]*"|'[^']*')/);
    if (ariaMatch) {
      return `aria-label=${ariaMatch[1]} onClick={`;
    }
    const quoteMatch = mid.match(/("[^"]*"|'[^']*')/);
    if (quoteMatch) {
      return `aria-label=${quoteMatch[1]} onClick={`;
    }
    // otherwise, leave unchanged
    return m;
  });

  // also handle pattern where onClick={ = "..." ... > fn() }
  const re2 = /onClick=\{\s*=\s*("[^"]*"|'[^']*')([\s\S]*?)\}/g;
  txt = txt.replace(re2, (m, q, rest) => {
    // If rest contains onClick or a call expression, convert
    if (/onClick=\{/.test(rest) || /\([\s\S]*\)\s*$/.test(rest)) {
      return `aria-label=${q} onClick={() => ${rest.replace(/^[\s>]+/, '')}}`;
    }
    return m;
  });

  if (txt !== orig) {
    fs.writeFileSync(f + '.bak4', orig, 'utf8');
    fs.writeFileSync(f, txt, 'utf8');
    patched.push(path.relative(process.cwd(), f));
  }
}

console.log('Fuzzy patched files:', patched.length);
if(patched.length) console.log(patched.join('\n'));
