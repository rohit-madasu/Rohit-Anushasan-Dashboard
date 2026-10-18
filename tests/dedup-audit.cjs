'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),C=require('../calendar-core.js'),old=require('./baseline-calendar-core.js'),box={window:{}};
for(const f of ['data.js',...JSON.parse(fs.readFileSync(path.join(root,'search-assets.json'),'utf8')).orderedScripts])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),box);
const data=box.window.HEARING_DATA,search=box.window.CASE_SEARCH_DATA;
const enrich=r=>({...r,...(search.rowPartyBindings[r.rowId]?{privateParties:search.rowPartyBindings[r.rowId].parties,privatePartyBinding:search.rowPartyBindings[r.rowId]}:{}),...(search.rowCaseBindings[r.rowId]?{privateCase:search.rowCaseBindings[r.rowId].case||search.rowCaseBindings[r.rowId].caseIdentifier,privateCaseBinding:search.rowCaseBindings[r.rowId]}:{})});
const view={...data,currentRows:data.currentRows.map(enrich),historyRows:[...data.historyRows.map(enrich),...search.supplementaryCalendarRows]};
const results={baselineDataJsSha256:data.lineage.baselineDataJsSha256,legacyGroupingComparatorZipSha256:'84c4d2fa5cf4e6e432585a983185ce2579a1e7a4ff32e8173022d972028b7896',editionDate:data.referenceDate,policy:'Display groups only; original evidence, profiles and per-date appearances retained.',filters:[],examples:[],changedDays:[]};
for(const kind of ['all','matched','official','office','mirror','candidate','order','named','history','historical_source']){
 const selected=C.selectRows(view,{kind,today:data.referenceDate}),before=old.groupRows(selected),ids=new Set(selected.map(r=>r.rowId)),eligible=kind==='history'?selected:C.selectRows(view,{kind:'all',today:data.referenceDate}),after=C.groupRows(eligible).filter(g=>g.rowIds.some(id=>ids.has(id)));
 results.filters.push({kind,selectedSourceRows:selected.length,beforeDisplayCards:before.length,afterDisplayCards:after.length,underlyingEvidenceRows:after.reduce((n,g)=>n+g.records.length,0),dates:new Set(after.map(g=>g.date)).size});
 if(kind==='all'){
  for(const file of ['168','169','51']){const day='2026-10-22',b=before.filter(g=>g.date===day&&g.files.includes(file)),a=after.filter(g=>g.date===day&&g.files.includes(file));results.examples.push({file,date:day,beforeCards:b.length,afterCards:a.length,sourceRows:a[0].records.length,summaryRowId:a[0].summaryRowId,summaryAsOf:a[0].sourceAsOf,summaryCase:a[0].case,summaryParties:a[0].parties,summaryCourt:a[0].court,sourceRowsRetained:a[0].rowIds});}
  for(const date of [...new Set(selected.map(r=>r.date))].sort()){const b=before.filter(g=>g.date===date).length,a=after.filter(g=>g.date===date).length;if(a!==b)results.changedDays.push({date,before:b,after:a});}
 }
}
results.profiles={total:search.profiles.length,running:search.profiles.filter(p=>p.recordKind==='running_source_profile').length,closed:search.profiles.filter(p=>p.recordKind==='closed_register_row').length,uniqueProfileIds:new Set(search.profiles.map(p=>p.id)).size};
fs.writeFileSync(path.join(__dirname,'results','dedup-audit.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({...results,changedDays:{count:results.changedDays.length,oct21:results.changedDays.find(d=>d.date==='2026-10-21')}},null,2));
