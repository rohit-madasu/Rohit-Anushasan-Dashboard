'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
for(const file of ['data.js',...JSON.parse(fs.readFileSync(path.join(root,'search-assets.json'),'utf8')).orderedScripts,'courts.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
const index=sandbox.window.CASE_SEARCH_DATA,styles=sandbox.window.COURT_STYLES,data=sandbox.window.HEARING_DATA;
const core=require('../calendar-core.js'),profiles=index.profiles,running=profiles.filter(p=>p.recordKind==='running_source_profile'),closed=profiles.filter(p=>p.recordKind==='closed_register_row');
assert.equal(profiles.length,455);assert.equal(new Set(profiles.map(p=>p.id)).size,455);
assert.equal(running.length,298);assert.equal(closed.length,157);
assert.equal(new Set(running.flatMap(p=>p.files)).size,299);
for(let n=1;n<=157;n++)assert(closed.some(p=>p.id==='closed:'+String(n).padStart(3,'0')),'closed physical row '+n+' missing');
for(const [category,count]of Object.entries({active:86,disposed:26,unclear:186}))assert.equal(running.filter(p=>p.category===category).length,count);
assert(profiles.every(p=>Array.isArray(p.sourceRecords)&&p.sourceRecords.length),'Every profile must retain separate source records');
console.log('PASS: all 298 running profiles, 299 running file locators and 157 distinct closed physical rows are preserved without profile merging.');
const sourceIds=new Set(index.sources.map(s=>s.id));
assert.equal(new Set(index.corpusUnits.map(u=>u.id)).size,index.corpusUnits.length);
for(const source of index.sources)assert.equal(index.corpusUnits.filter(u=>u.sourceId===source.id).length,source.units,source.id+' corpus unit count');
assert(index.corpusUnits.every(u=>sourceIds.has(u.sourceId)&&u.locator&&typeof u.text==='string'),'Corpus units need known source and locator');
console.log(`PASS: ${index.corpusUnits.length.toLocaleString()} uniquely traceable raw source units match source-specific counts.`);
const searchIndex=core.createSearchIndex(profiles);
assert.equal(core.searchProfiles(searchIndex,'').length,455);
for(const p of [running[0],running[100],closed[0],closed[156]]){
 const q=p.parties;
 assert(core.searchProfiles(searchIndex,q).some(m=>m.profile.id===p.id),'Full search misses '+p.id);
}
console.log('PASS: full-profile search includes running and closed corpus samples.');
const normalized=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const sourceText=new Map(index.sources.map(s=>[s.id,normalized(index.corpusUnits.filter(u=>u.sourceId===s.id).map(u=>u.text).join(' '))]));
const evidenceIDs=new Set(data.historyRows.map(r=>r.rowId));
for(const [id,b]of Object.entries(index.rowPartyBindings||{})){
 assert(evidenceIDs.has(id),'Unknown bound evidence row '+id);assert(sourceIds.has(b.sourceId));assert(b.locator&&b.qualification&&b.bindingRule);
 assert.equal(b.sourceMaskPreserved,true);
 // Joining recorded party sides with “vs” is formatting; each literal side must exist in the declared source.
 for(const side of (b.literalPartyNames||b.parties.split(/\s+(?:vs\.?|versus|v\.?)\s+/i)))assert(sourceText.get(b.sourceId).includes(normalized(side)),'Bound party text absent from its source: '+id);
}
console.log(`PASS: ${Object.keys(index.rowPartyBindings||{}).length} party bindings point to retained evidence and recorded source names; original masks remain in raw rows.`);
assert.equal(Object.keys(index.rowCaseBindings||{}).length,5);
for(const [id,b]of Object.entries(index.rowCaseBindings||{})){
 assert(evidenceIDs.has(id));assert(sourceIds.has(b.sourceId));assert(b.locator&&b.qualification&&b.bindingRule);
 assert(core.normalizeIdentity(sourceText.get(b.sourceId)).replace(/\s/g,'').includes(core.normalizeIdentity(b.case||b.caseIdentifier).replace(/\s/g,'')),'Bound case identifier absent source: '+id);
}
const supplements=index.supplementaryCalendarRows||[];
assert.equal(supplements.length,5260);assert.equal(new Set(supplements.map(r=>r.rowId)).size,supplements.length);
for(const r of supplements){assert(!evidenceIDs.has(r.rowId),'Supplement reuses original ID');assert.equal(r.historyOnly,true);assert.equal(r.checkedThisRun,false);assert.equal(r.freshRecoveryCheck,false);assert.equal(r.includeInMatchedOfficialDefault,false);assert.equal(r.includeInPotentialUpcoming,false);assert(r.sources.length&&r.qualifications.length);}
const merged={...data,historyRows:[...data.historyRows,...supplements]},futureSupplementIDs=new Set(supplements.filter(r=>r.date>=data.referenceDate).map(r=>r.rowId));
assert(core.selectRows(merged,{kind:'history'}).length===data.historyRows.length+supplements.length);
assert(!core.selectRows(merged,{kind:'all'}).some(r=>futureSupplementIDs.has(r.rowId)),'Historical table dates must not become future appointments');
console.log(`PASS: ${Object.keys(index.rowCaseBindings).length} source-linked case bindings and ${supplements.length.toLocaleString()} separately qualified historical table rows preserve current appointment semantics.`);
function luminance(hex){const c=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
const entries=Object.values(styles),ratios=[];
const expectedCourtLabels=new Set([...data.currentRows,...data.historyRows,...data.unidentifiedLeads,...(index.supplementaryCalendarRows||[])].map(r=>r.court).concat(profiles.flatMap(p=>[p.court,...(p.courts||[])])).map(v=>String(v||'').trim()).filter(Boolean));
for(const label of expectedCourtLabels)assert(styles[label],'Missing exact court style: '+label);
assert.equal(new Set(entries.map(s=>s.className)).size,new Set(entries.map(s=>s.canonicalKey)).size);
for(const a of entries)for(const b of entries)if(a.className===b.className)assert.equal(a.canonicalKey,b.canonicalKey,'Color identity must be explicit');
const css=fs.readFileSync(path.join(root,'court-colors.css'),'utf8');
for(const [key,style]of Object.entries(styles)){
 assert.equal(style.label,key);assert(/^#[a-f0-9]{6}$/i.test(style.color));assert(/^#[a-f0-9]{6}$/i.test(style.background));
 const l1=luminance(style.color),l2=luminance(style.background),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);ratios.push(ratio);assert(ratio>=4.5,'Insufficient court text contrast: '+key+' '+ratio);
 assert(css.includes('.'+style.className+'{--court-ink:'+style.color+';--court-soft:'+style.background+'}'),'Court CSS mismatch '+key);
}
console.log(`PASS: ${entries.length} exact-label court styles have matching CSS and normal-text contrast of at least ${Math.min(...ratios).toFixed(2)}:1.`);
const incrementalBaseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-invariants.json'),'utf8')).dailyIncrementalBaseline;
const digest=v=>require('node:crypto').createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
for(const[label,hash]of Object.entries(incrementalBaseline.originalCourtStyles))assert.equal(digest(Object.fromEntries(Object.entries(styles[label]).filter(([key])=>!key.startsWith("location")))),hash,'Original court style changed: '+label);
const rules=new Set(css.trim().split('\n').map(digest));for(const hash of incrementalBaseline.originalCourtCssRuleHashes)assert(rules.has(hash),'Original court CSS rule removed or changed');
console.log('PASS: all retained original court style objects and every original CSS rule remain exact; new labels are additive only.');
