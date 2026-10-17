'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),b=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-invariants.json'),'utf8')),baseline=b.dailyIncrementalBaseline,sandbox={window:{}};
for(const f of ['data.js','case-search-data.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const data=sandbox.window.HEARING_DATA,search=sandbox.window.CASE_SEARCH_DATA;
const hash=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const history=new Map(data.historyRows.map(r=>[r.rowId,r])),current=new Map(data.currentRows.map(r=>[r.rowId,r]));
assert.equal(history.size,data.historyRows.length);assert.equal(current.size,data.currentRows.length);
for(const old of baseline.originalHistoryRows)assert.equal(hash(history.get(old.id)),old.sha256,'Original historical evidence mutated: '+old.id);
const allSourceHashes=new Set(data.historyRows.flatMap(r=>r.sources.map(hash))),allEventIds=new Set(data.historyRows.flatMap(r=>r.eventIds)),allEvidenceIds=new Set(data.historyRows.flatMap(r=>r.evidenceIds));
for(const old of baseline.originalCurrentRows){
 for(const h of old.sourceHashes)assert(allSourceHashes.has(h),'Original aggregated source reference lost: '+old.id);for(const id of old.eventIds)assert(allEventIds.has(id));for(const id of old.evidenceIds)assert(allEvidenceIds.has(id));
 if(current.has(old.id)){const r=current.get(old.id);if(hash(r)!==old.sha256){const archived=(data.lineage.retiredCurrentProjectionSnapshots||[]).find(x=>x.rowId===old.id);assert(archived);assert.equal(hash(archived),old.sha256);const restored={...r};for(const flag of ['checkedThisRun','freshRecoveryCheck']){assert(r[flag]===archived[flag]||(archived[flag]===true&&r[flag]===false));if(flag in archived)restored[flag]=archived[flag];}assert.equal(hash(restored),old.sha256,'Only run-local aging flags may change: '+old.id);}}
 else{
  const r=history.get(old.id);assert(r,'Original current evidence lost: '+old.id);const archived=(data.lineage.retiredCurrentProjectionSnapshots||[]).find(x=>x.rowId===old.id);assert(archived,'Exact former current projection missing: '+old.id);assert.equal(hash(archived),old.sha256,'Former current display changed: '+old.id);
  const facts=Object.fromEntries(Object.entries(r).filter(([k])=>!['historyOnly','rowRole','qualifications','includeInPotentialUpcoming','includeInMatchedOfficialDefault','eventIds','evidenceIds','sources'].includes(k)));
  assert.equal(hash(facts),old.sourceFactsSha256,'Elapsed/superseded source facts mutated: '+old.id);
  const qualifications=new Set(archived.qualifications.map(hash));for(const h of old.qualificationHashes)assert(qualifications.has(h),'Original qualification lost: '+old.id);
 }
}
for(const [key,h]of Object.entries(baseline.unchangedFields)){const value=key==='trackingOverlay'&&data.lineage.priorTrackingSummary?{...data.trackingOverlay,...data.lineage.priorTrackingSummary}:data[key];assert.equal(hash(value),h,key+' baseline facts changed');}
if(data.lineage.priorTrackingSummary){const expected=data.lineage.priorTrackingSummary.suppressedCurrentRows.filter(r=>r.date>=data.referenceDate);assert.equal(hash(data.trackingOverlay.suppressedCurrentRows),hash(expected));assert.equal(data.trackingOverlay.currentRowsSuppressedCount,expected.length);assert.equal(data.trackingOverlay.inheritedCurrentSuppressedCount,expected.length);}
assert.equal(hash(search.corpusUnits.slice(0,baseline.search.originalCorpusCount)),baseline.search.originalCorpusSha256,'Original source corpus changed');
assert.equal(hash(search.supplementaryCalendarRows),baseline.search.originalSupplementaryRowsSha256);
assert.equal(hash(Object.fromEntries(baseline.search.rowPartyBindingIds.map(id=>[id,search.rowPartyBindings[id]]))),baseline.search.rowPartyBindingsSha256);assert.equal(hash(search.rowCaseBindings),baseline.search.rowCaseBindingsSha256);
assert.equal(hash(search.sources.slice(0,4)),baseline.search.sourcesSha256,'Original source bindings changed');
const profileFacts=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['sourceRecords','history','sourceUrls','sourceRecordsCount','searchText','caveats','caseIdentifiers','courts','courtKeys','courtEvidence'].includes(k)));
const profiles=new Map(search.profiles.map(p=>[p.id,p]));assert.equal(profiles.size,455);assert.equal(search.profiles.length,455);
for(const old of baseline.search.profiles){
 const p=profiles.get(old.id);assert(p,'Profile missing: '+old.id);assert.equal(hash(profileFacts(p)),old.factsSha256,old.id+' original profile facts changed');
 assert.equal(hash(p.sourceRecords.slice(0,old.sourceRecordsCount)),old.sourceRecordsSha256,old.id+' source history changed');
 assert.equal(hash(p.history.slice(0,old.historyCount)),old.historySha256,old.id+' original calendar history changed');
 for(const[k,v]of Object.entries(old.extensibleFields))assert.equal(hash(p[k].slice(0,v.count)),v.sha256,old.id+' '+k+' original prefix changed');
 assert.equal(hash(p.searchText.slice(0,old.searchTextLength)),old.searchTextSha256,old.id+' original full search text changed');
 const keys=p.sourceRecords.map(r=>r.sourceId+'\u0000'+r.locator);const newKeys=keys.slice(old.sourceRecordsCount);assert.equal(new Set(newKeys).size,newKeys.length,'Duplicate new profile source locator: '+old.id);for(const key of newKeys)assert(!keys.slice(0,old.sourceRecordsCount).includes(key),'Re-appended old profile source locator: '+old.id);
}
for(const[file,h]of Object.entries(baseline.immutableRuntime))assert.equal(hash(fs.readFileSync(path.join(root,file),'utf8')),h,file+' changed from CNR-safe baseline');
for(const row of data.historyRows){assert.equal(row.historyOnly,true);assert(row.rowId&&row.sources?.length);for(const source of row.sources)assert(source.eventId&&source.evidenceObjectSha256);}
if(data.referenceDate==='2026-10-17'){
 assert(data.lineage.baselineZipSha256===baseline.baselineZipSha256);
 assert(data.sourceDocumentSha256!==baseline.sourceDocumentSha256,'New edition incorrectly bound to old source bytes');
 assert.equal(data.historyRows.length,baseline.originalHistoryRows.length+data.lineage.appendedHistoryRows);
 assert(data.currentRows.every(r=>r.date>=data.referenceDate),'Elapsed rows remain upcoming');
 assert.equal(data.coverage.whatsapp.freshReviewCompleted,false);assert.match(data.coverage.whatsapp.displaySummary,/not reviewed|not freshly reviewed|not completed/i);
 const revision=search.sources.find(s=>s.id==='stage-2026-10-17');assert(revision&&revision.sha256===data.sourceDocumentSha256);
 const mapping=search.sourceRevisionCoverage[revision.id],ids=new Set(search.corpusUnits.map(u=>u.id));let count=0,expected=1;
 for(const range of mapping.coverageRanges){assert.equal(range.documentStart,expected);for(let n=range.sourceStart;n<=range.sourceEnd;n++)assert(ids.has(range.sourceId+':'+n),'Coverage points to missing source unit');const length=range.documentEnd-range.documentStart+1;assert.equal(length,range.sourceEnd-range.sourceStart+1);count+=length;expected=range.documentEnd+1;}
 assert.equal(count,revision.totalDocumentUnits);assert.equal(revision.retainedEquivalentUnits,42508);assert.equal(revision.totalDocumentUnits,42508+revision.units);
 const expectedBinding=b.dailyExpectedBinding;if(expectedBinding){assert.equal(data.sourceDocumentSha256,expectedBinding.sourceDocumentSha256);assert.equal(data.sourcePdfSha256,expectedBinding.sourcePdfSha256);assert.equal(data.sourceDocumentUrl,expectedBinding.sourceDocumentUrl);assert.equal(data.sourcePdfUrl,expectedBinding.sourcePdfUrl);}
}
console.log('PASS: immutable source corpus, all historical events and profiles, retained current facts, explicit source coverage, tracking exclusions, CNR UI and byte-exact six-hour auth assets.');
if(data.referenceDate==='2026-10-17'){
 const revision=search.sources.find(s=>s.id==='running-2026-10-17');assert(revision);assert.equal(revision.driveId,'1R_ihanbcQ0nxQw_dknLuXoiBy37-Rt0p');assert.equal(revision.sha256,'72988067b1371c33aa1a3509e03e33da99a68d46d879ebfd040358657bf597f0');
 assert.equal(revision.units,27);assert.equal(revision.totalDocumentUnits,281);assert.equal(revision.retainedEquivalentUnits,254);assert.equal(search.corpusUnits.length,57656);
 const mapping=search.sourceRevisionCoverage[revision.id],ids=new Set(search.corpusUnits.map(u=>u.id));let count=0,next=1;for(const range of mapping.coverageRanges){assert.equal(range.documentStart,next);for(let n=range.sourceStart;n<=range.sourceEnd;n++)assert(ids.has(range.sourceId+':'+n));const length=range.documentEnd-range.documentStart+1;assert.equal(length,range.sourceEnd-range.sourceStart+1);count+=length;next=range.documentEnd+1;}assert.equal(count,281);assert.equal(mapping.terminalLinefeedCompatibility.count,254);assert.equal(mapping.stagePageMap.length,26);
 assert.equal(search.currentSourceCatalog.running.sourceId,revision.id);assert.equal(search.currentSourceCatalog.running.url,revision.url);assert.equal(search.currentSourceCatalog.stage.url,data.sourceDocumentUrl);assert.equal(search.currentSourceCatalog.closed.sourceId,'closed');
 for(const p of search.profiles.filter(p=>p.recordKind==='running_source_profile'))assert.equal(hash(p.sourceUrls.slice(-2)),hash([data.sourceDocumentUrl,revision.url]));
 console.log('PASS: complete current 281-page running register with 254 immutable retained page mappings, 27 new page units, current catalog and current links on every running profile.');
}
