'use strict';
// Render-string and UI-event harness. Real layout/contrast still requires browser QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
class Element {constructor(){this.listeners={};this.value='';this.textContent='';this.innerHTML='';this.hidden=false;this.children=[];this.dataset={};this.attributes={};this.classList={toggle(){},add(){},remove(){}};}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}emit(k,event={}){for(const fn of this.listeners[k]||[])fn(event);}setAttribute(k,v){this.attributes[k]=v;}focus(){}scrollIntoView(){}after(){}querySelector(){return new Element();}matches(){return false;}}
function setup(extra={}){const elements=new Map(),get=id=>{if(!elements.has(id)){const e=new Element();e.parentElement=new Element();elements.set(id,e);}return elements.get(id);};get('evidenceFilter').value='all';const doc=new Element();doc.getElementById=get;doc.createElement=()=>new Element();doc.querySelector=()=>new Element();
 class TestDate extends Date {constructor(...a){super(...(a.length?a:['2026-10-17T00:00:00Z']));}static now(){return Date.parse('2026-10-17T00:00:00Z');}}
 const win=new Element(),ctx=vm.createContext({window:win,document:doc,Date:TestDate,Intl,performance:{now:()=>0},matchMedia:()=>({matches:false}),setTimeout,Blob,URL});
 for(const f of ['data.js','calendar-core.js','courts.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
 win.CASE_SEARCH_DATA={profiles:[
  {id:'active-test',file:'73A',parties:'Alice v Bob',caseIdentifiers:['O.S. 101/2024'],category:'active',court:'I AFC / Kalpataru',sourceRecords:[]},
  {id:'closed-test',file:'73B',parties:'Carol v Dan',caseIdentifiers:['C.C. 202/2020'],category:'disposed',recordKind:'closed_register_row',court:'Court B',sourceRecords:[]},
  {id:'undated-test',file:'9',parties:'Eve v Frank',caseIdentifiers:[],category:'unclear',sourceRecords:[]}
 ],sources:[{id:'fixture',url:'https://docs.google.com/document/d/fixture'}],rowPartyBindings:{},corpusUnits:[{id:'fixture:unique',sourceId:'fixture',locator:'Test paragraph 1',text:'Unique qatest memorandum <script>untrusted source content</script>',sourceUrl:'https://docs.google.com/document/d/fixture'}]};
 Object.assign(win.CASE_SEARCH_DATA,extra);
 vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);
 return {get,win,doc,pick(date){get('calendar').emit('click',{target:{closest:()=>({dataset:{date}})}});},search(q){get('caseSearch').value=q;get('caseSearch').emit('input');}};
}

const h=setup();for(let i=0;i<8;i++)h.get('next').onclick();assert.match(h.get('monthTitle').textContent,/June 2027/);assert.equal((h.get('calendar').innerHTML.match(/data-date=/g)||[]).length,30);h.pick('2027-06-25');assert.match(h.get('cards').innerHTML,/TSMM090005852026/);assert.match(h.get('cards').innerHTML,/SC233\/2026/);assert.match(h.get('cards').innerHTML,/2027-06-25/);assert(h.win.HEARING_DATA.currentRows.some(r=>r.cnr==='TSMM090005852026'&&r.date==='2027-06-25'));h.pick('2027-06-26');assert.equal(h.get('cards').innerHTML.includes('TSMM090005852026'),false);console.log('PASS June 2027 year rollover, long-date event and adjacent empty-date isolation');
