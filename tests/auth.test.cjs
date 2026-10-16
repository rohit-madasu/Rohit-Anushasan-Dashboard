'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const auth = require(path.join(__dirname, '..', 'auth.js'));
const salt=Buffer.from('isolated-test-salt-only');
const testPassword='Synthetic test secret: do not use for the deliverable';
const config={version:1,algorithm:'PBKDF2-SHA256',iterations:100000,saltBase64:salt.toString('base64'),verifierBase64:crypto.pbkdf2Sync(testPassword,salt,100000,32,'sha256').toString('base64'),sessionHours:6};
const now=Date.parse('2026-10-17T00:00:00Z');
const record={version:1,startedAt:now,expiresAt:now+6*60*60*1000,verifier:config.verifierBase64};
const tests=[]; const test=(name,fn)=>tests.push([name,fn]);

test('session duration is exactly six hours',()=>assert.equal(auth.SESSION_MS,21600000));
test('session valid immediately and one millisecond before expiry',()=>{
  assert(auth.isValidSession(record,now,config));
  assert(auth.isValidSession(record,record.expiresAt-1,config));
});
test('session invalid at expiry and afterwards',()=>{
  assert.equal(auth.isValidSession(record,record.expiresAt,config),false);
  assert.equal(auth.isValidSession(record,record.expiresAt+1,config),false);
});
test('malformed, future, altered-duration and foreign-verifier records fail closed',()=>{
  const bad=[null,{},[],{...record,version:2},{...record,startedAt:now+1},{...record,startedAt:String(now)},
    {...record,expiresAt:record.expiresAt+1},{...record,expiresAt:record.expiresAt-1},{...record,expiresAt:NaN},
    {...record,verifier:'wrong-verifier'}];
  for(const item of bad)assert.equal(auth.isValidSession(item,now,config),false,JSON.stringify(item));
});
test('invalid configuration cannot restore session',()=>{
  for(const item of [null,{}, {...config,version:2},{...config,algorithm:'plaintext'},{...config,iterations:99999},{...config,sessionHours:7}])
    assert.equal(auth.isValidSession(record,now,item),false);
});
test('expiry calculation never extends from read',()=>{
  assert.equal(auth.remainingMs(record,now),21600000);
  assert.equal(auth.remainingMs(record,now+1000),21599000);
  assert.equal(auth.remainingMs(record,record.expiresAt+1),0);
  assert.equal(record.startedAt,now);
  assert.equal(record.expiresAt,now+21600000);
});
test('derived password verifier accepts exact input and rejects other input',async()=>{
  assert.equal(await auth.verifyPassword(testPassword,config),true);
  assert.equal(await auth.verifyPassword(testPassword+' ',config),false);
  assert.equal(await auth.verifyPassword('',config),false);
});
(async()=>{let failed=0;for(const [name,fn]of tests){try{await fn();console.log('PASS:',name);}catch(error){failed++;console.error('FAIL:',name,'\n',error.message);}}if(failed)process.exitCode=1;else console.log(`PASS: all ${tests.length} absolute-session regressions.`);})();
