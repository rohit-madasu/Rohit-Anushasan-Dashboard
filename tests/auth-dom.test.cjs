'use strict';
// Focused UI/state-model harness. This is not a visual/browser test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','auth.js'),'utf8');
const password='Synthetic DOM fixture password only',salt=Buffer.from('dom-test-only-salt');
const config={version:1,algorithm:'PBKDF2-SHA256',iterations:100000,saltBase64:salt.toString('base64'),verifierBase64:crypto.pbkdf2Sync(password,salt,100000,32,'sha256').toString('base64'),sessionHours:6};
const key='anushasan.private.session.v1',duration=21600000,start=1792195200000;
class Target {constructor(){this.listeners={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.type='password';this.attributes={};this.focused=false;}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}dispatchEvent(e){for(const fn of this.listeners[e.type]||[])fn(e);}setAttribute(k,v){this.attributes[k]=v;}focus(){this.focused=true;}}
function harness({storage=new Map(),now=start,storageDenied=false,authConfig=config}={}){
 const state={now,timers:[],storage};const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,new Target());return elements.get(id);};get('dashboard').hidden=true;
 const document=new Target();document.getElementById=get;document.body={classList:{add(){},remove(){}}};
 class FakeDate extends Date {static now(){return state.now;}}
 const root=new Target();root.crypto=crypto.webcrypto;root.AUTH_CONFIG=authConfig;
 const context={window:root,document,Date:FakeDate,Event:class Event{constructor(type){this.type=type;}},TextEncoder,Uint8Array,atob,
  sessionStorage:{getItem(k){if(storageDenied)throw Error('Storage unavailable');return storage.get(k)||null;},setItem(k,v){if(storageDenied)throw Error('Storage unavailable');storage.set(k,v);},removeItem(k){if(storageDenied)throw Error('Storage unavailable');storage.delete(k);}},
  setInterval(fn){state.timers.push(fn);return state.timers.length;}};
 vm.runInNewContext(source,context);root.SessionLock.init();
 return {state,get,root,document,async submit(text=password){get('password').value=text;for(const fn of get('loginForm').listeners.submit||[])await fn({preventDefault(){}});},click(id){get(id).onclick();}};
}
const tests=[];const test=(n,f)=>tests.push([n,f]);
test('initial lock hides dashboard and clears password',()=>{const h=harness();assert(h.get('dashboard').hidden);assert(!h.get('loginScreen').hidden);assert.equal(h.get('password').value,'');});
test('incorrect password fails and clears plaintext input',async()=>{const h=harness();await h.submit('wrong');assert(h.get('dashboard').hidden);assert.match(h.get('loginError').textContent,/doesn’t match/);assert.equal(h.get('password').value,'');});
test('correct login opens dashboard and stores exactly six-hour verifier-bound session',async()=>{const h=harness();await h.submit();assert(!h.get('dashboard').hidden);assert(h.get('loginScreen').hidden);const r=JSON.parse(h.state.storage.get(key));assert.equal(r.startedAt,start);assert.equal(r.expiresAt,start+duration);assert.equal(r.verifier,config.verifierBase64);assert(!h.state.storage.get(key).includes(password));assert.equal(h.get('password').value,'');});
test('restore and focus retain absolute expiry without extending session',async()=>{const h=harness();await h.submit();const before=h.state.storage.get(key);const restored=harness({storage:h.state.storage,now:start+60000});assert(!restored.get('dashboard').hidden);restored.root.dispatchEvent({type:'focus'});assert.equal(restored.state.storage.get(key),before);assert.match(restored.get('sessionTimer').textContent,/5:59:00/);});
test('logout clears stored session, password visibility and dashboard',async()=>{const h=harness();await h.submit();h.click('showPassword');assert.equal(h.get('password').type,'text');h.click('logout');assert(h.get('dashboard').hidden);assert(!h.state.storage.has(key));assert.equal(h.get('password').type,'password');assert.equal(h.get('showPassword').attributes['aria-pressed'],'false');assert(harness({storage:h.state.storage}).get('dashboard').hidden);});
for(const type of ['focus','pageshow','visibilitychange'])test('expiry locks on '+type,async()=>{const h=harness();await h.submit();h.state.now=start+duration;(type==='visibilitychange'?h.document:h.root).dispatchEvent({type});assert(h.get('dashboard').hidden);assert(!h.state.storage.has(key));assert.match(h.get('loginError').textContent,/expired/);});
test('timer locks at exact absolute expiry without activity',async()=>{const h=harness();await h.submit();h.state.now=start+duration-1;h.state.timers[0]();assert(!h.get('dashboard').hidden);h.state.now++;h.state.timers[0]();assert(h.get('dashboard').hidden);});
test('expired and malformed stored sessions fail closed',()=>{for(const value of ['{malformed',JSON.stringify({version:1,startedAt:start-duration,expiresAt:start,verifier:config.verifierBase64}),JSON.stringify({version:1,startedAt:start+1,expiresAt:start+1+duration,verifier:config.verifierBase64})]){const h=harness({storage:new Map([[key,value]])});assert(h.get('dashboard').hidden);assert(!h.state.storage.has(key));}});
test('unavailable storage permits only temporary in-memory login with clear notice',async()=>{const h=harness({storageDenied:true});await h.submit();assert(!h.get('dashboard').hidden);assert.match(h.get('sessionNotice').textContent,/cannot save/);h.state.now+=duration;h.state.timers[0]();assert(h.get('dashboard').hidden);});
test('pending password validation cannot undo a later lock',async()=>{const h=harness();const pending=h.submit();h.click('logout');await pending;assert(h.get('dashboard').hidden);assert(!h.state.storage.has(key));});
test('invalid auth configuration disables login with useful error',()=>{const h=harness({authConfig:{}});assert(h.get('loginButton').disabled);assert.match(h.get('loginError').textContent,/configuration/);});
(async()=>{let failed=0;for(const[n,f]of tests){try{await f();console.log('PASS:',n);}catch(e){failed++;console.error('FAIL:',n,'\n',e.message);}}if(failed)process.exitCode=1;else console.log(`PASS: all ${tests.length} auth DOM/state regressions; visual browser tests are separate.`);})();
