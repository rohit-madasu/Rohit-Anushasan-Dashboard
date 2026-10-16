'use strict';
// Tests inject a synthetic verifier into an isolated browser context only.
// The artifact and its real verifier are never rewritten or copied into this test.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const output=path.join(__dirname,'results');fs.mkdirSync(output,{recursive:true});
const synthetic='Browser fixture password only';const salt=Buffer.from('isolated-browser-salt');
const config={version:1,algorithm:'PBKDF2-SHA256',iterations:100000,saltBase64:salt.toString('base64'),verifierBase64:crypto.pbkdf2Sync(synthetic,salt,100000,32,'sha256').toString('base64'),sessionHours:6};
const key='anushasan.private.session.v1';const duration=21600000;
const report={artifact:path.basename(target),sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),checks:[],pageErrors:[],externalRequests:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(config=>Object.defineProperty(window,'AUTH_CONFIG',{configurable:true,get:()=>config,set:()=>{}}),config);
 await context.route(/https?:\/\//,route=>{report.externalRequests.push(route.request().url());return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));
 const check=async(name,fn)=>{try{await fn();report.checks.push({name,status:'passed'});console.log('PASS:',name);}catch(e){report.checks.push({name,status:'failed',error:e.message});console.error('FAIL:',name,e.message);throw e;}};
 const visible=async(selector)=>assert(await page.locator(selector).isVisible(),selector+' should be visible');
 const hidden=async(selector)=>assert(await page.locator(selector).isHidden(),selector+' should be hidden');
 const login=async()=>{await page.fill('#password',synthetic);await page.click('#loginButton');await page.waitForFunction(()=>document.getElementById('dashboard')?.hidden===false);};
 try{
  await page.goto(pathToFileURL(target).href);
  await check('initial page is locked with no active stored session',async()=>{await visible('#loginScreen');await hidden('#dashboard');assert.equal(await page.inputValue('#password'),'');});
  await check('incorrect password fails and input is cleared',async()=>{await page.fill('#password','wrong fixture value');await page.click('#loginButton');await page.waitForFunction(()=>document.getElementById('loginError')?.textContent.includes('doesn’t match'));await hidden('#dashboard');assert.equal(await page.inputValue('#password'),'');});
  await check('show/hide password control is keyboard-accessible and reversible',async()=>{await page.click('#showPassword');assert.equal(await page.getAttribute('#password','type'),'text');assert.equal(await page.getAttribute('#showPassword','aria-pressed'),'true');await page.click('#showPassword');assert.equal(await page.getAttribute('#password','type'),'password');});
  await check('synthetic correct password unlocks for exactly six hours',async()=>{await login();await visible('#dashboard');await hidden('#loginScreen');const record=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)),key);assert.equal(record.expiresAt-record.startedAt,duration);assert.equal(record.verifier,config.verifierBase64);assert.equal(await page.inputValue('#password'),'');assert(!JSON.stringify(record).includes(synthetic));});
  await check('reload and focus preserve the original absolute expiry',async()=>{const before=await page.evaluate(key=>sessionStorage.getItem(key),key);await page.reload();await visible('#dashboard');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));const after=await page.evaluate(key=>sessionStorage.getItem(key),key);assert.equal(after,before);});
  await page.screenshot({path:path.join(output,'desktop-unlocked.png'),fullPage:true});
  await check('logout relocks and clears stored session',async()=>{await page.click('#logout');await visible('#loginScreen');await hidden('#dashboard');assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),key),null);await page.reload();await hidden('#dashboard');});
  await check('expired session cannot be restored on reload',async()=>{await login();await page.evaluate(({key,duration})=>{const r=JSON.parse(sessionStorage.getItem(key));r.startedAt=Date.now()-duration-1;r.expiresAt=r.startedAt+duration;sessionStorage.setItem(key,JSON.stringify(r));},{key,duration});await page.reload();await hidden('#dashboard');await visible('#loginScreen');});
  for(const event of ['focus','visibilitychange','pageshow'])await check('expired session locks on '+event,async()=>{await login();await page.evaluate(({key,event})=>{const expiry=JSON.parse(sessionStorage.getItem(key)).expiresAt;Date.now=()=>expiry;(event==='visibilitychange'?document:window).dispatchEvent(new Event(event));},{key,event});await hidden('#dashboard');await page.reload();});
  await check('one-second timer locks an expiring session without user activity',async()=>{await login();await page.evaluate(({key,duration})=>{const r=JSON.parse(sessionStorage.getItem(key));r.expiresAt=Date.now()+500;r.startedAt=r.expiresAt-duration;sessionStorage.setItem(key,JSON.stringify(r));},{key,duration});await page.reload();await page.waitForFunction(()=>document.getElementById('dashboard')?.hidden===true,{},{timeout:4000});await visible('#loginScreen');});
  await check('malformed stored JSON fails closed',async()=>{await page.evaluate(key=>sessionStorage.setItem(key,'{malformed'),key);await page.reload();await visible('#loginScreen');await hidden('#dashboard');});
  await check('future-dated stored session fails closed',async()=>{await page.evaluate(({key,config,duration})=>{const start=Date.now()+100000;sessionStorage.setItem(key,JSON.stringify({version:1,startedAt:start,expiresAt:start+duration,verifier:config.verifierBase64}));},{key,config,duration});await page.reload();await hidden('#dashboard');});
  await check('initial loading and auth flows make no external requests',async()=>assert.deepEqual(report.externalRequests,[]));
  await check('browser emits no runtime errors',async()=>assert.deepEqual(report.pageErrors,[]));
 }catch(e){report.failure=e.message;process.exitCode=1;}
 finally{fs.writeFileSync(path.join(output,'browser-auth-report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log('Report:',path.join(output,'browser-auth-report.json'));}
})();
