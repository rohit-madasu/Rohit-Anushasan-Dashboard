'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const core=require('../calendar-core.js'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','data.js'),'utf8'),sandbox);
const data=sandbox.window.HEARING_DATA,today='2026-10-16';
const leads=new Set(data.unidentifiedLeads.map(r=>r.rowId));
const stopped=new Set(data.trackingOverlay.matchedHistoricalRowIds);
const history=core.selectRows(data,{kind:'history',today});
let failed=0;
function check(name,fn){try{fn();console.log('PASS:',name);}catch(e){failed++;console.error('FAIL:',name,'\n',e.message);}}
check('non-history calendar counts exclude separately displayed unidentified leads',()=>{
  for(const kind of ['all','matched','office','official','candidate','mirror','order','named']){
    const overlap=core.selectRows(data,{kind,today}).filter(r=>leads.has(r.rowId));
    assert.equal(overlap.length,0,kind+' includes '+overlap.length+' separate leads');
  }
});
check('future/current tracking-stopped rows do not re-enter non-history calendar views',()=>{
  for(const kind of ['all','matched','office','official','candidate','mirror','order','named']){
    const overlap=core.selectRows(data,{kind,today}).filter(r=>r.date>=today&&stopped.has(r.rowId));
    assert.equal(overlap.length,0,kind+' restores '+overlap.length+' tracking-stopped rows');
  }
});
check('history retains every original lead and tracking-stopped evidence row',()=>{
  const ids=new Set(history.map(r=>r.rowId));
  for(const id of [...leads,...stopped])assert(ids.has(id),id+' missing from explicit history');
  assert.equal(history.length,data.historyRows.length);
});
if(failed)process.exitCode=1;
