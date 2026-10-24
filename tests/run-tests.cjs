'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const tests=['daily-oct24.test.cjs','display-consolidation.test.cjs','calendar-core.test.cjs','cnr-dedup.test.cjs','case-search.test.cjs','auth.test.cjs','auth-dom.test.cjs','app-dom.test.cjs','source-semantics.test.cjs','location-colours.test.cjs'];
const root=path.resolve(__dirname,'..');
const artifacts=['data.js','calendar-core.js','app.js','auth.js','index.html','styles.css',...JSON.parse(fs.readFileSync(path.join(root,'search-assets.json'),'utf8')).orderedScripts,'courts.js','court-colors.css'].filter(f=>fs.existsSync(path.join(root,f)));
const report={testedAt:new Date().toISOString(),scope:'Node source/model/render-event checks; browser visual and offline-file checks are separate.',files:Object.fromEntries(artifacts.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),tests:[]};
for(const name of tests){const r=spawnSync(process.execPath,['--max-old-space-size=768',path.join(__dirname,name)],{cwd:root,encoding:'utf8'});const item={name,status:r.status===0?'passed':'failed',exitCode:r.status,output:(r.stdout||'')+(r.stderr||'')};report.tests.push(item);console.log(item.status.toUpperCase()+': '+name);if(item.status==='failed')console.log(item.output);}
report.passed=report.tests.every(t=>t.status==='passed');fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results','node-test-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('Report: tests/results/node-test-report.json');if(!report.passed)process.exitCode=1;
