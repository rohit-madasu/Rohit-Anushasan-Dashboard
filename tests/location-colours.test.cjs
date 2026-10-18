'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'courts.js'),'utf8'),ctx);
const styles=ctx.window.COURT_STYLES;
for(const [label,s] of Object.entries(styles)){
 assert.equal(label,s.label);assert(s.locationClassName&&s.locationBasis&&s.locationLabel);
 const same=Object.values(styles).filter(t=>t.locationKey===s.locationKey);
 assert(same.every(t=>t.locationClassName===s.locationClassName&&t.locationColor===s.locationColor&&t.locationBackground===s.locationBackground));
}
const find=q=>Object.entries(styles).filter(([s])=>s.includes(q)).map(([,v])=>v);
assert(find('Kukatpally').length>20);assert(find('Kalpataru').length>5);
assert(find('Kalpataru').every(s=>s.locationKey==='kalpataru'));
assert(find('L.B. Nagar, Kukatpally').every(s=>s.locationKey==='unknown'));
assert(find('Kalpataru complex, LB Nagar').every(s=>s.locationKey==='kalpataru'));
assert.equal(styles['[Not stated]'].locationKey,'unknown');
assert.equal(styles['1-PRINCIPAL FAMILY COURT'].locationKey,'unknown');
const samples=['1-III Addl District and Sessions Judge-cum-Principal Family Court Medchal-Malkajgiri Dist at Kukatpally','XIV M.M., Kukatpally [per office diary p.250] - Kukatpally, Hyderabad'];
assert.equal(styles[samples[0]].locationClassName,styles[samples[1]].locationClassName);
function lum(h){const c=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
for(const s of Object.values(styles))assert((lum(s.locationBackground)+.05)/(lum(s.locationColor)+.05)>=4.5);
console.log('PASS: location grouping, Kalpataru specificity, ambiguous-location neutral fallback, exact label preservation and AA contrast.');
