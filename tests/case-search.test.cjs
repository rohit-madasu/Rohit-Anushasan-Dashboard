'use strict';
const assert=require('node:assert/strict');
const core=require('../calendar-core.js');
const profiles=[
  {profileId:'running',file:'73A',parties:'Alice v Bob',caseIdentifiers:['O.S. 101/2024'],category:'active',court:'First Court',cnr:'CNRABCD0001',evidence:[]},
  {profileId:'closed',file:'73B',parties:'Carol v Dan',caseIdentifiers:['C.C. 202/2020'],category:'disposed',court:'Second Court',cnr:'CNRABCD0002',evidence:[]},
  {profileId:'undated',file:'9',parties:'Eve v Frank',caseIdentifiers:[],category:'unclear',court:'No listing in source',evidence:[]}
];
const index=core.createSearchIndex(profiles);
const ids=q=>core.searchProfiles(index,q).map(x=>x.profile.profileId);
assert.deepEqual(ids(''),['running','closed','undated']);
for(const q of ['Carol','C.C. 202/2020','202/2020','73B','Second Court','CNRABCD0002','disposed'])assert(ids(q).includes('closed'),q);
assert.deepEqual(ids('73A'),['running']);
assert.deepEqual(ids('73B'),['closed']);
assert(ids('Eve').includes('undated'));
assert.deepEqual(ids('no-such-identity-zz'),[]);
assert.deepEqual(ids(' CAROL   v   DAN '),['closed']);
assert.deepEqual(ids('C.C.202/2020'),['closed']);
assert.deepEqual(profiles.map(x=>x.profileId),['running','closed','undated']);
console.log('PASS: full-corpus live search includes running, closed and undated profiles and exact file suffixes.');
