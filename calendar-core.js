(function(root){
'use strict';
function isoToday(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');}
function addDays(iso,n){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function selectRows(data,{kind='matched',query='',today=isoToday()}={}){const source=kind==='history'?data.historyRows:data.currentRows;const seen=new Set();return source.filter(r=>{if(seen.has(r.rowId))throw Error('Duplicate explicit row ID');seen.add(r.rowId);if(kind!=='history'&&(r.includeInPotentialUpcoming!==true||r.date<today))return false;if(kind==='matched'&&r.includeInMatchedOfficialDefault!==true)return false;if(!['matched','all','history'].includes(kind)&&r.kind!==kind)return false;return !query||JSON.stringify([r.files,r.case,r.parties,r.court,r.stage,r.cnr]).toLowerCase().includes(query.toLowerCase());}).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||String(a.files[0]||'zzz').localeCompare(String(b.files[0]||'zzz'),undefined,{numeric:true})||a.rowId.localeCompare(b.rowId));}
const api={isoToday,addDays,selectRows};root.CalendarCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
