'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
for(const f of ['data.js',...JSON.parse(fs.readFileSync(path.join(root,'search-assets.json'))).orderedScripts])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const d=ctx.window.HEARING_DATA,s=ctx.window.CASE_SEARCH_DATA,C=require('../calendar-core.js');
for(const [id,expected] of Object.entries({'running:141':'7913','running:227':'28','running:288':'605','running:77':'18','running:281':'20'})){
 const p=s.profiles.find(x=>x.id===id);assert(p);assert.equal(p.category,'active');assert(JSON.stringify(p.comprehensiveClassificationCorrection).includes(expected));
}
for(const cnr of ['TSRA000025742026','TSMM110047112023','TSRA460104962021','TSRA000074662022','TSRA030032882020']){
 assert(!d.currentRows.some(r=>r.cnr===cnr),'Disposed exact docket retained in upcoming: '+cnr);
 assert([...d.historyRows,...(d.undatedProceduralUpdates||[])].some(r=>r.cnr===cnr),'Disposed evidence lost: '+cnr);
}
const commission=d.currentRows.filter(r=>r.date==='2026-10-31'&&/commission|11:30/i.test(JSON.stringify(r)));assert(commission.length,'Separate commission appointment missing');
assert(d.currentRows.some(r=>r.date==='2026-11-05'&&/218|32\/2024/.test(JSON.stringify(r))),'Court hearing improperly replaced by commission');
for(const r of [...d.currentRows,...d.historyRows,...(d.undatedProceduralUpdates||[])].filter(x=>x.freshRecoveryCheck)){assert(!/ versus /i.test(r.advocate||''),'Opponent leaked into advocate role');}
const resolve=C.createDisplayResolver(s,d),rows=C.selectRows(d,{kind:'all',today:d.referenceDate}).map(resolve),groups=C.groupRows(rows);
assert.equal(groups.reduce((n,g)=>n+g.records.length,0),rows.length);
const count=JSON.stringify(d.comprehensiveReviewOct28);assert(/135/.test(count)&&/120/.test(count)&&/15/.test(count));
console.log('PASS: exact disposed scopes removed from current projection, historical evidence retained, dated identifier corrections active, commission separate from court hearing, all evidence mapped without duplicate row loss.');
