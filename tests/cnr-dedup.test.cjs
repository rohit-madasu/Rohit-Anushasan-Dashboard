'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const C=require('../calendar-core.js'),root=path.resolve(__dirname,'..'),sandbox={window:{}};
for(const f of ['data.js',...JSON.parse(fs.readFileSync(path.join(root,'search-assets.json'),'utf8')).orderedScripts,'courts.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const data=sandbox.window.HEARING_DATA,search=sandbox.window.CASE_SEARCH_DATA,styles=sandbox.window.COURT_STYLES;
const enrich=r=>({...r,...(search.rowPartyBindings?.[r.rowId]?{privateParties:search.rowPartyBindings[r.rowId].parties,privatePartyBinding:search.rowPartyBindings[r.rowId]}:{}),...(search.rowCaseBindings?.[r.rowId]?{privateCase:search.rowCaseBindings[r.rowId].case||search.rowCaseBindings[r.rowId].caseIdentifier,privateCaseBinding:search.rowCaseBindings[r.rowId]}:{})});
const dataView={...data,currentRows:data.currentRows.map(enrich),historyRows:[...data.historyRows.map(enrich),...search.supplementaryCalendarRows]};
const row=(change={})=>({rowId:'a',date:'2026-10-21',files:['51'],cnr:'TSMM110055252022',case:'DVC 92/2022',parties:'A versus B',kind:'official',profileIdentityVerified:true,recordIdentityVerified:true,sourceAsOf:'2026-10-02T17:57:48Z',sources:[],qualifications:[],...change});
const pairs=[['CC 405/2026','Criminal Complaint Case 405/2026'],['D.V.C. 92/2022','DVC92/2022'],['F.C.O.P. 386/2024','FCOP386/2024']];
for(const [a,b]of pairs)assert.equal(C.canonicalCase(a),C.canonicalCase(b));
for(const [a,b]of pairs)assert.equal(C.groupRows([row({case:a}),row({rowId:'b',case:b})]).length,1);
for(const change of [{cnr:'TSMM110055262022'},{case:'DVC 93/2022'},{case:'CC 92/2022'},{case:'EP 92/2022'},{case:'IA 1/2026 in DVC 92/2022'},{combinedSourceReference:true},{case:'OS 1/2020 and OS 2/2020'},{identityConflict:true}])assert.equal(C.groupRows([row(),row({rowId:'b',...change})]).length,2,JSON.stringify(change));
assert.equal(C.groupRows([row({profileId:'running:51'}),row({rowId:'b',profileId:'running:52'})]).length,1,'Exact docket can share a card while separate profile associations remain');
for(const files of [['51A'],['52']]){const g=C.groupRows([row(),row({rowId:'b',files})]);assert.equal(g.length,1);assert.equal(g[0].fileAssociations.length,2);assert(g[0].multipleFileAssociations);}
assert.equal(C.groupRows([row({case:'IA 1/2026 in OS 2/2024'}),row({rowId:'b',case:'IA 2/2026 in OS 2/2024'})]).length,2);
assert.equal(C.groupRows([row({case:'OS 1/2024'}),row({rowId:'b',case:'EP 1/2024'})]).length,2);
assert.equal(C.groupRows([row({cnr:'',case:'D.V.C. 92/2022'}),row({cnr:'',rowId:'b',case:'DVC92/2022'})]).length,1);
assert.equal(C.groupRows([row({cnr:'',case:'D.V.C. 92/2022'}),row({cnr:'',rowId:'b',parties:'Other party',case:'DVC92/2022'})]).length,2);
assert.equal(C.groupRows([row({cnr:'',case:'O.S. 10/2024 (retained exact annotation)'}),row({cnr:'',rowId:'b',case:'O.S. 10/2024 (retained exact annotation)'})]).length,1);
const ambiguous=[row({rowId:'unknown',cnr:''}),row({rowId:'one'}),row({rowId:'two',cnr:'TSMM110055262022'})];
for(const order of [ambiguous,[...ambiguous].reverse(),[ambiguous[1],ambiguous[0],ambiguous[2]]])assert.equal(C.groupRows(order).length,3,'Missing CNR must not choose between distinct CNRs');
const ambiguousCases=[row({rowId:'masked',case:'Protected proceeding · identifier withheld'}),row({rowId:'one',case:'OS 1/2024'}),row({rowId:'two',case:'OS 2/2024'})];
for(const order of [ambiguousCases,[...ambiguousCases].reverse()])assert.equal(C.groupRows(order).length,3,'Missing case must not choose between distinct proceedings');
for(const file of ['169','51']){
 const expectedIds=file==='169'?['baseline:107','baseline:110','bounded:official:2026-10-16T07:18:20+05:30:TSNP020001992024:169:listing:2026-10-21']:['baseline:108','baseline:111','bounded:official:2026-10-16T07:17:32+05:30:TSMM110055252022:51:listing:2026-10-21'];const original=data.historyRows.filter(r=>expectedIds.includes(r.rowId));assert.equal(original.length,3);
 const before=JSON.stringify(original),group=C.groupRows(original);assert.equal(group.length,1);assert.equal(group[0].records.length,3);assert(group[0].sourceAsOf.startsWith('2026-10-16'));assert.equal(group[0].kind,'official');assert.equal(JSON.stringify(original),before);
 for(const r of original)assert.equal(styles[r.court].className,styles[group[0].court].className,'Same example court aliases use consistent colors');
}
for(const kind of ['all','matched','official','office','mirror','candidate','order','named','history','historical_source']){
 const rows=C.selectRows(dataView,{kind,today:data.referenceDate}),original=JSON.stringify(rows),groups=C.groupRows(rows);
 assert.equal(groups.reduce((n,g)=>n+g.records.length,0),rows.length,kind+' loses source rows');assert.equal(JSON.stringify(rows),original,kind+' mutates sources');
 for(const group of groups){assert.equal(new Set(group.records.map(r=>C.validCnr(r.displayDocketCnr||r.cnr)).filter(Boolean)).size<=1,true,'Different CNRs merged');assert(new Set(group.records.map(r=>C.fileIdentity(r))).size===1||group.multipleFileAssociations,'Different file associations must remain explicit');assert.equal(new Set(group.records.map(r=>r.date)).size,1,'Different calendar days merged');}
}
assert.equal(search.profiles.length,455);assert.equal(new Set(search.profiles.map(p=>p.id)).size,455);
console.log('PASS: CNR identity, explicit case aliases, independent applications, distinct CNRs, file suffixes, conflicting profiles, ambiguous bridges, fallback, source preservation, all filters, latest official summaries and example court colors.');
if(data.referenceDate==='2026-10-17'){
 const daily=data.currentRows.filter(r=>r.rowId.startsWith('daily:')),fresh=daily.filter(r=>r.checkedThisRun),prior=daily.filter(r=>!r.checkedThisRun);
 assert.equal(daily.length,18);assert.equal(fresh.length,15);assert.equal(prior.length,3);assert.equal(new Set(fresh.flatMap(r=>r.files)).size,11);
 assert.equal(fresh.filter(r=>r.kind==='official').length,13);assert.equal(fresh.filter(r=>r.kind==='candidate').length,2);
 for(const r of daily){assert.equal(r.sources[0].asOf,r.sourceObservedAtExactIST);assert.equal(r.sourceAsOf,r.sourceObservedAtExactIST.replace(/\.\d+(?=[+-]\d\d:\d\d$)/,''));assert(C.observedTime(r)>0);assert.equal(r.sources[0].eventDate,r.date);assert(r.sources[0].timestampSemantics.includes('display/ranking'));assert.equal(data.historyRows.filter(h=>h.rowId===r.rowId).length,1);}
 for(const r of fresh){assert(r.sourceObservedAtExactIST.startsWith('2026-10-17'));const predecessors=data.historyRows.filter(h=>!h.rowId.startsWith('daily:')&&h.cnr===r.cnr&&C.fileIdentity(h)===C.fileIdentity(r)&&C.compatibleIdentity(C.identityParts(h),C.identityParts(r)));assert(predecessors.length,'Fresh record has no retained source predecessor: '+r.cnr);for(const old of predecessors.filter(h=>h.kind===r.kind&&h.sourceAsOf.startsWith('2026-10-16')))assert.equal(C.representativeRows([enrich(old),enrich(r)])[0].rowId,r.rowId,'Newest daily official/candidate rank: '+r.cnr);}
 for(const r of prior){assert.equal(r.kind,'candidate');assert.equal(r.profileIdentityVerified,false);assert.equal(r.includeInMatchedOfficialDefault,false);assert.equal(r.freshRecoveryCheck,false);assert(r.sourceObservedAtExactIST.startsWith('2026-10-16T11:5'));assert.match(r.qualifications.join(' '),/not a fresh 17 October/);}
 const cnrs=['TSMN010002142025','TSRA000021692026','TSRA000018722026','TSRA000021702026','TSRA000021712026'];
 for(const cnr of cnrs){const rows=data.currentRows.filter(r=>r.cnr===cnr);assert.equal(rows.length,1);assert.equal(rows[0].date,cnr===cnrs[0]?'2026-11-26':'2026-10-23');assert(data.historyRows.some(r=>r.cnr===cnr&&r.date==='2026-10-16'));}
 const all=C.groupRows(C.selectRows(dataView,{kind:'all',today:data.referenceDate}));
 for(const file of ['169','51']){const groups=all.filter(g=>g.files.includes(file)&&g.date==='2026-10-21');assert.equal(groups.length,1);assert.equal(groups[0].records.length,3);}
 const pocso=all.filter(g=>g.files.includes('259')&&g.date==='2026-10-23');assert.equal(pocso.length,4);assert.equal(new Set(pocso.map(g=>g.cnr)).size,4);assert.equal(pocso.filter(g=>g.kind==='candidate').length,2);
 const file255=all.filter(g=>g.files.includes('255')&&g.date==='2026-10-29'&&g.kind==='official');assert.equal(file255.length,2);assert(file255.every(g=>g.summaryRowId.startsWith('daily:oct17:')));
 const conflicted=all.filter(g=>g.files.includes('130')&&g.date==='2026-10-21');assert.equal(conflicted.length,2,'Conflicting office 386/2026 must not merge with candidate 386/2024');
 for(const file of ['123','257']){const r=prior.find(r=>r.files.includes(file)),g=all.find(g=>g.rowIds.includes(r.rowId));assert(g&&g.records.some(x=>x.rowId===r.rowId&&x.kind==='candidate'&&!x.profileIdentityVerified));assert(g.qualifications.includes(r.qualifications[0]));}
 const fir=fresh.find(r=>r.files.includes('191'));assert.match(fir.qualifications.join(' '),/FIR number is blank and Year 0 is a displayed placeholder/);
 assert.equal(data.currentRows.filter(r=>r.checkedThisRun).length,15);assert.equal(data.currentRows.filter(r=>r.freshRecoveryCheck).length,15);
 console.log('PASS: Oct 17 incremental dates, exact observation clocks, fresh/prior counts, newest summary ranking, five changed dates, candidate qualifications, and no duplicated appointments.');
}
if(data.referenceDate==='2026-10-17'){
 const rows=data.currentRows.filter(r=>r.rowId.startsWith('daily:'));
 for(const row of rows){const e=enrich(row);assert(!C.unavailable(C.partyTitle(e)));assert(!/Party names unavailable|XXXX|protected party withheld/i.test(C.partyTitle(e)),'Source-grounded party heading missing: '+row.rowId);if(row.parties==null){const b=search.rowPartyBindings[row.rowId];assert(b);assert.equal(b.sourceId,'stage-2026-10-17');assert.equal(b.eventId,row.rowId);assert.equal(b.cnr,row.cnr);assert.equal(C.fileIdentity({files:b.files}),C.fileIdentity(row));assert.equal(b.locator,row.sources[0].locator);assert(b.literalPartyNames.length>=2);assert.equal(b.normalizedConvenienceFieldPreserved,true);}}
 const allNew=Object.entries(search.rowPartyBindings).filter(([id])=>id.startsWith('daily:'));assert.equal(allNew.length,16);assert.equal(allNew.filter(([,b])=>b.sourceId==='stage-2026-10-17').length,10);
 console.log('PASS: all 18 new observation headings display available source-grounded names, with ten null convenience fields safely bound to their exact stage source sections and every original event unchanged.');
}

assert.equal(data.referenceDate,'2026-10-28');
assert(data.currentRows.every(r=>r.date>=data.referenceDate));
for(const file of ['110','233']) assert(!C.selectRows(dataView,{kind:'all',today:data.referenceDate}).some(r=>r.files.includes(file)&&r.date>=data.referenceDate),'Stopped scope restored');
if(data.comprehensiveReviewOct28){assert.equal(data.coverage.freshDistinctRecordChecks,data.comprehensiveReviewOct28.counts.currentRetrievedCNRs);assert.equal(data.coverage.freshStatusDocketChecks,data.coverage.freshDistinctRecordChecks);}else{assert.equal(data.coverage.freshDistinctRecordChecks,0);assert.equal(data.coverage.freshStatusDocketChecks,0);}assert.equal(data.coverage.currentRun.allCasesChecked,false);
assert(data.currentRows.some(r=>r.files.includes('48')&&r.date==='2026-11-17'&&r.kind==='office'));
assert(data.currentRows.some(r=>r.files.includes('108')&&r.date==='2026-11-02'&&r.kind==='office'));
console.log('PASS: current edition, elapsed segregation, tracking exclusions and new qualified office dates.');
