(function(root){
'use strict';
const SESSION_HOURS=6;
function isoToday(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');}
function addDays(iso,n){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
// Display equality only: no alias, initial, spelling, suffix, year or case-type inference.
function normalizeIdentity(s){return String(s??'').normalize('NFKC').toLocaleLowerCase('en').replace(/[\p{P}\p{S}]+/gu,' ').replace(/\s+/g,' ').trim();}
function unavailable(s){const text=String(s??'').trim().replace(/^\[|\]$/g,'').trim();return !text||/^(?:names? withheld(?: for safeguarding)?|protected (?:proceeding|matter)(?:\s*[·:;–-]\s*.*)?|(?:party )?names? (?:not (?:stated|supplied|available|included|recorded)|masked|withheld)(?:\s+.*)?|not (?:stated|supplied|available|included|recorded|established)(?: in .*|; prior history refers only to .*)?|unavailable(?: in .*)?|unknown(?: parties| party names?)?)$/i.test(text);}
function partyTitle(r){return unavailable(r.privateParties||r.parties)?'Party names unavailable in source':String(r.privateParties||r.parties).trim();}
function strictIdentity(s){return String(s??'').normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,' ').trim();}
// CNR identity is file-scoped. A shared parent CNR never erases a distinct application.
const CASE_TYPE_ALIASES={criminalcomplaintcase:'CC',domesticviolencecase:'DVC',originalsuit:'OS',familycourtoriginalpetition:'FCOP',familycourtop:'FCOP',criminalappeal:'CRLA',motorvehiclecompensationcase:'MVOP'};
function canonicalCase(value){
  if(unavailable(value))return null;
  let text=String(value).normalize('NFKC').trim();
  // Only an entire typed identifier is canonicalized; qualifiers/compound cases remain literal.
  const m=text.match(/^([A-Za-z.\s]+?)\s*(?:No\.?\s*)?(\d+[A-Za-z]?)\s*(?:\/|\bof\b)\s*(\d{4})$/i);
  if(!m)return null;
  const raw=m[1].replace(/[.\s]/g,'').toLowerCase(),type=CASE_TYPE_ALIASES[raw]||raw.toUpperCase();
  if(!/^[A-Z]{1,16}$/.test(type))return null;
  return type+' '+m[2].toUpperCase()+'/'+m[3];
}
function validCnr(value){const s=String(value||'').trim().toUpperCase();return /^[A-Z]{4}[A-Z0-9]{2}\d{10}$/.test(s)?s:null;}
function fileIdentity(r){const files=(r.files||[]).map(strictIdentity).filter(Boolean).sort();return files.length&&files.every(f=>/^\d+[a-z]?$/.test(f))?JSON.stringify(files):null;}
function profileBinding(r){const ids=[r.profileId,r.privatePartyBinding?.profileId,r.privateCaseBinding?.profileId].filter(Boolean);return [...new Set(ids)].sort();}
function partyIdentity(r){const p=r.privateParties||r.parties;return unavailable(p)||/(?:withheld|masked|unknown|not (?:stated|supplied|available|included|recorded|written|restated))/i.test(p)?null:strictIdentity(p);}
function applicationIdentity(r){
  const value=String(r.privateCase||r.case||''),canonical=canonicalCase(value);
  const child=/^(?:IA|EA|CRLMP|CMP|MP|CRLMA|CM|MISCAPPLICATION)\s/.test(canonical||'')||/\b(?:interlocutory|execution application|application\s+(?:no\.?\s*)?\d|I\.?\s*A\.?\s*\d|E\.?\s*A\.?\s*\d|Crl\.?\s*M\.?P\.?\s*\d)/i.test(value)||r.parentCnr||r.parentCase||r.applicationId;
  return child?String(r.applicationId||canonical||strictIdentity(value)):null;
}
function identityParts(r){if(r.combinedSourceReference===true)return null;const file=fileIdentity(r);if(!file)return null;const cnr=validCnr(r.cnr),caseId=canonicalCase(r.privateCase||r.case),party=partyIdentity(r),profiles=profileBinding(r);if(profiles.length>1||r.identityConflict===true||/rejected|contradictory|mismatch/.test(String(r.identityConfidence||'')))return null;
  const originalCase=r.privateCase||r.case,completeCase=!unavailable(originalCase)&&!/(?:withheld|masked|unknown|not (?:stated|supplied|available|included|recorded))/i.test(originalCase);
  const genericType=/^Criminal Complaint Case/i.test(originalCase)?'criminal':/^Miscellaneous Judicial Case \(Civil\)/i.test(originalCase)?'civil':/^Civil Miscellaneous Application/i.test(originalCase)?'maintenance':null;
  const unparsedCase=completeCase&&!caseId&&!genericType?strictIdentity(originalCase):null;
  if(cnr)return {file,cnr,caseId,party,profiles,application:applicationIdentity(r),genericType,unparsedCase};
  if(!completeCase||!party)return null;
  return {file,cnr:null,caseId:caseId||'literal:'+strictIdentity(originalCase),party,profiles,application:applicationIdentity(r),genericType};
}
function rowIdentity(r){const p=identityParts(r);return p?JSON.stringify(p.cnr?[p.file,'CNR',p.cnr,p.application]:[p.file,'case+parties',p.caseId,p.party]):null;}
function compatibleIdentity(a,b){
  if(!a||!b||a.file!==b.file)return false;
  if(a.profiles.length&&b.profiles.length&&a.profiles[0]!==b.profiles[0])return false;
  if(a.application!==b.application)return false;
  if(a.cnr&&b.cnr){if(a.cnr!==b.cnr)return false;if((a.unparsedCase||b.unparsedCase)&&a.unparsedCase!==b.unparsedCase)return false;if(a.caseId&&b.caseId&&a.caseId!==b.caseId){const number=id=>id.match(/ (\d+[A-Z]?\/\d{4})$/)?.[1],type=id=>id.split(' ')[0],genericMatch=(x,y)=>x.genericType==='criminal'&&['CC','CCNI','STCNI'].includes(type(y.caseId));if(number(a.caseId)!==number(b.caseId)||!(genericMatch(a,b)||genericMatch(b,a)))return false;}return true;}
  // A missing CNR may join only a typed exact case and complete party match.
  return !!a.caseId&&a.caseId===b.caseId&&!!a.party&&a.party===b.party;
}
function observedTime(r){const value=String(r.sourceAsOf||'');const iso=value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})/);if(iso)return Date.parse(iso[0]);const m=value.match(/(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i);if(m){const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];return Date.UTC(Number(m[3]),months.indexOf(m[2].slice(0,3).toLowerCase()),Number(m[1]));}return 0;}
function representativeRows(rows){return [...rows].sort((a,b)=>{
  const rank=r=>r.kind==='official'&&r.profileIdentityVerified===true&&r.recordIdentityVerified===true?4:r.kind==='official'?3:r.kind==='office'?2:r.kind==='mirror'?1:0;
  return rank(b)-rank(a)||observedTime(b)-observedTime(a)||Number(b.checkedThisRun===true)-Number(a.checkedThisRun===true)||String(a.rowId).localeCompare(String(b.rowId));
});}
function groupRows(rows,{byDate=true}={}){
  const groups=[],buckets=new Map();
  const inputOrder=new Map(rows.map((r,i)=>[r,i]));
  const ordered=[...rows].sort((a,b)=>Number(!!validCnr(b.cnr))-Number(!!validCnr(a.cnr))||profileBinding(b).length-profileBinding(a).length||Number(!!canonicalCase(b.privateCase||b.case))-Number(!!canonicalCase(a.privateCase||a.case)));
  for(const r of ordered){
    const p=identityParts(r),key=p?JSON.stringify([p.file,byDate?r.date:null]):null,bucket=key?buckets.get(key)||[]:[];
    // Compare every established member so a missing-CNR row cannot bridge two different CNRs or profiles.
    const candidates=p?bucket.filter(g=>g.identityParts.every(other=>compatibleIdentity(p,other))):[];
    let g=candidates.length===1?candidates[0]:null;
    if(!g){g={records:[],identityParts:[]};groups.push(g);if(key){bucket.push(g);buckets.set(key,bucket);}}
    g.records.push(r);if(p)g.identityParts.push(p);
  }
  return groups.sort((a,b)=>Math.min(...a.records.map(r=>inputOrder.get(r)))-Math.min(...b.records.map(r=>inputOrder.get(r)))).map(({records})=>{
    records.sort((a,b)=>inputOrder.get(a)-inputOrder.get(b));
    const preferred=representativeRows(records)[0],g={...preferred,groupId:records.map(r=>r.rowId).sort()[0],records,dates:[],rowIds:[],eventIds:[],evidenceIds:[],qualifications:[],sources:[],conflictIds:[],summaryRowId:preferred.rowId};
    for(const r of records){for(const field of ['eventIds','evidenceIds','qualifications','conflictIds'])for(const v of r[field]||[])if(!g[field].includes(v))g[field].push(v);if(r.date&&!g.dates.includes(r.date))g.dates.push(r.date);g.rowIds.push(r.rowId);g.sources.push(...(r.sources||[]));}
    g.dates.sort();g.sourceCount=records.length;g.historyOnly=records.every(r=>r.historyOnly);g.checkedThisRun=preferred.checkedThisRun===true;
    g.identityBasis=records.length<2?'Single source row':validCnr(preferred.cnr)?'Same valid CNR and exact file mapping; distinct applications kept separate':'Exact file mapping, canonical typed case and complete party binding';
    return g;
  });
}
function selectRows(data,{kind='matched',query='',today=isoToday()}={}){let source;if(kind==='history')source=data.historyRows||[];else{const currentIds=new Set((data.currentRows||[]).map(r=>r.rowId));source=[...(data.currentRows||[]),...(data.historyRows||[]).filter(r=>!currentIds.has(r.rowId)&&r.date<(data.referenceDate||today))];}const leadIds=new Set((data.unidentifiedLeads||[]).map(r=>r.rowId)),seen=new Set(),needle=normalizeIdentity(query);return source.filter(r=>{if(seen.has(r.rowId))throw Error('Duplicate explicit row ID: '+r.rowId);seen.add(r.rowId);if(!r.date)return false;if(kind!=='history'&&leadIds.has(r.rowId))return false;if(kind==='matched'&&r.includeInMatchedOfficialDefault!==true&&!(r.historyOnly&&r.date<(data.referenceDate||today)&&r.kind==='official'&&r.profileIdentityVerified===true&&r.recordIdentityVerified===true))return false;if(!['matched','all','history'].includes(kind)&&r.kind!==kind)return false;return !needle||normalizeIdentity(JSON.stringify([r.files,r.case,r.privateParties,r.parties,r.court,r.stage,r.cnr])).includes(needle);}).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||partyTitle(a).localeCompare(partyTitle(b))||String(a.files?.[0]||'zzz').localeCompare(String(b.files?.[0]||'zzz'),undefined,{numeric:true})||a.rowId.localeCompare(b.rowId));}
function strings(value,out=[]){if(typeof value==='string'||typeof value==='number')out.push(String(value));else if(Array.isArray(value))value.forEach(v=>strings(v,out));else if(value&&typeof value==='object')Object.values(value).forEach(v=>strings(v,out));return out;}
function createSearchIndex(profiles){return profiles.map((profile,i)=>{const fields={parties:profile.parties||profile.partyNames||'',case:profile.caseIdentifiers||profile.cases||profile.case||'',file:profile.files||profile.file||'',full:profile};const normalized={};for(const [k,v] of Object.entries(fields)){const text=normalizeIdentity(strings(v).join(' '));normalized[k]=text;normalized[k+'Compact']=text.replace(/\s/g,'');}return {profile,index:i,fields:normalized};});}
function searchProfiles(index,query){const fileQuery=String(query).trim().match(/^(?:file(?:\s*(?:no\.?|number))?|#)\s*[:#]?\s*(\d+[a-z]?)$/i);if(fileQuery){const file=normalizeIdentity(fileQuery[1]);return index.filter(item=>(item.profile.files||[item.profile.file]).some(value=>normalizeIdentity(value)===file)).map(item=>({...item,matchedFields:['file']}));}const q=normalizeIdentity(query),tokens=q.split(' ').filter(Boolean),compact=q.replace(/\s/g,'');if(!q)return index.map(item=>({...item,matchedFields:[]}));const results=[];for(const item of index){const f=item.fields;if(!tokens.every(t=>f.full.includes(t))&&!f.fullCompact.includes(compact))continue;const matchedFields=['parties','case','file'].filter(k=>tokens.every(t=>f[k].includes(t))||f[k+'Compact'].includes(compact));results.push({...item,matchedFields:matchedFields.length?matchedFields:['full source fields']});}return results.sort((a,b)=>{const score=i=>i.fields.file===q?0:i.fields.parties===q?1:i.fields.case===q?2:i.matchedFields.includes('file')?3:i.matchedFields.includes('parties')?4:i.matchedFields.includes('case')?5:6;return score(a)-score(b)||a.index-b.index;});}
const api={isoToday,addDays,normalizeIdentity,strictIdentity,unavailable,partyTitle,canonicalCase,validCnr,fileIdentity,profileBinding,applicationIdentity,identityParts,compatibleIdentity,observedTime,representativeRows,rowIdentity,groupRows,selectRows,createSearchIndex,searchProfiles,strings,SESSION_HOURS};root.CalendarCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
