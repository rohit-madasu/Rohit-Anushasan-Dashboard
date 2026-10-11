(function(root){
  'use strict';
  const rank={official:0,candidate:1,named:2,order:3,office:4,mirror:5};
  const normalizeCase=s=>String(s||'').split('\n')[0].replace(/Unrecognized case type/gi,'').replace(/[^a-z0-9]/gi,'').toUpperCase();
  const masked=s=>!s||/^masked|^X{3,}|^not (stated|available)|^parties (masked|not)/i.test(s);
  function groupEvents(events){
    const groups=new Map();
    events.filter(e=>!e.superseded).forEach(e=>{
      const key=[e.date,[...(e.files||[])].sort().join(','),e.cnr||normalizeCase(e.case)||e.id,e.reportedTimeIST||''].join('|');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);
    });
    return [...groups].map(([key,records])=>{
      records.sort((a,b)=>(rank[a.kind]??9)-(rank[b.kind]??9)||Number(b.id)-Number(a.id));
      const primary=records[0];
      // A named office reference supplies display context only; it never merges dates
      // or establishes the identity of a masked court record.
      const named=records.find(e=>!masked(e.parties))||events.find(e=>
        !masked(e.parties)&&e.files?.length&&
        [...e.files].sort().join(',')===[...(primary.files||[])].sort().join(',')&&
        normalizeCase(e.case)===normalizeCase(primary.case));
      return {key,records,primary,date:primary.date,parties:named?.parties||'Party names masked in court record',partySource:named&&named.id!==primary.id?named:null};
    }).sort((a,b)=>a.date.localeCompare(b.date)||String(a.primary.files?.[0]||'zzz').localeCompare(String(b.primary.files?.[0]||'zzz'),undefined,{numeric:true}));
  }
  function addDays(iso,n){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  const api={groupEvents,addDays,normalizeCase};root.CalendarCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
