'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const core = require(path.join(__dirname, '..', 'calendar-core.js'));
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
function row(overrides = {}) {
  return {
    rowId: 'test:1', date: '2026-10-01', files: ['73A'], case: 'O.S. 101/2024', parties: 'Alice v Bob',
    court: 'First Court', cnr: 'TESTCNR00001', stage: 'Hearing', kind: 'official',
    protected: false, includeInPotentialUpcoming: true, includeInMatchedOfficialDefault: true,
    qualifications: [], eventIds: ['event:1'], evidenceIds: ['evidence:1'],
    sources: [{eventId: 'event:1', evidenceObjectSha256: 'evidence-hash-1', asOf: 'original timestamp'}],
    ...overrides
  };
}
const groups = (rows, options) => core.groupRows(rows, options);

test('identity normalization only removes superficial text differences', () => {
  assert.equal(core.normalizeIdentity('  ALICE   v Bob  '), core.normalizeIdentity('Alice v Bob'));
  assert.notEqual(core.normalizeIdentity('73A'), core.normalizeIdentity('73B'));
  assert.notEqual(core.normalizeIdentity('73'), core.normalizeIdentity('73A'));
  assert.notEqual(core.normalizeIdentity('O.S. 101/24'), core.normalizeIdentity('O.S. 101/2024'));
  assert.notEqual(core.normalizeIdentity('Alice v Bob'), core.normalizeIdentity('Alice v Carol'));
});

test('same exact identity/day can collapse without losing evidence or conflicts', () => {
  const a = row();
  const b = row({rowId: 'test:2', court: 'Conflicting Court', stage: 'Conflicting purpose',
    qualifications: ['Source conflict must remain'], eventIds: ['event:2'], evidenceIds: ['evidence:2'],
    sources: [{eventId: 'event:2', evidenceObjectSha256: 'evidence-hash-2', asOf: 'second timestamp'}]});
  const before = JSON.stringify([a,b]);
  const result = groups([a,b]);
  assert.equal(result.length, 1);
  assert.equal(result[0].records.length, 2);
  assert.deepEqual(new Set(result[0].records.map(r => r.rowId)), new Set(['test:1','test:2']));
  assert.equal(JSON.stringify([a,b]), before, 'Grouping must not mutate source rows');
  assert(result[0].records.some(r => r.qualifications.includes('Source conflict must remain')));
});

test('different file suffixes, cases, parties and locator sets remain separate', () => {
  const a = row();
  for (const change of [{files:['73B']},{files:['73']},{files:['73A','74']},{case:'O.S. 102/2024'},{parties:'Alice v Carol'}]) {
    assert.equal(groups([a,row({rowId:'test:2',...change})]).length, 2, JSON.stringify(change));
  }
});

test('dedup does not erase punctuation that can distinguish source identities', () => {
  assert.equal(groups([row({rowId:'test:1',files:['1/2']}),row({rowId:'test:2',files:['1-2']})]).length,2);
  assert.equal(groups([row({rowId:'test:1',parties:'A & B'}),row({rowId:'test:2',parties:'A B'})]).length,2);
});

test('same identity on different dates remains on both calendar dates', () => {
  const input=[row(),row({rowId:'test:2',date:'2026-10-02'})];
  assert.equal(groups(input).length,2);
  assert.equal(groups(input,{byDate:false}).length,1);
  assert.equal(groups(input,{byDate:false})[0].records.length,2);
});

test('unknown identifiers, masked party placeholders and missing locators do not invent identity matches', () => {
  for (const change of [
    {files:[]},
    {case:'Protected proceeding · identifier withheld',parties:'Names withheld for safeguarding',protected:true},
    {case:'[Not stated]',parties:'[Not supplied]'}
  ]) {
    assert.equal(groups([row({rowId:'test:1',...change}),row({rowId:'test:2',...change})]).length,2, JSON.stringify(change));
  }
});

test('eligible dated rows are not discarded just because the date has elapsed', () => {
  const a=row();
  const data={currentRows:[a],historyRows:[],unidentifiedLeads:[]};
  assert(core.selectRows(data,{kind:'all',today:'2026-10-17'}).some(r => r.rowId===a.rowId || r.records?.some(x=>x.rowId===a.rowId)));
});

test('historical calendar can return dates before current month', () => {
  const a=row({date:'2023-11-22',historyOnly:true,includeInPotentialUpcoming:false});
  const data={currentRows:[],historyRows:[a],unidentifiedLeads:[]};
  assert(core.selectRows(data,{kind:'history',today:'2026-10-17'}).some(r => r.date==='2023-11-22'));
});

test('partial party labels retain known names without becoming complete dedup identities', () => {
  for(const parties of ['Akhila; opposing party not stated','Known Name vs [Name masked in source]','Known Name vs unknown','KVR Enterprises [opposing party not written]','Jitender; other party not restated']){
    assert.equal(core.unavailable(parties),false,parties);
    assert.equal(core.partyTitle({parties}),parties);
    assert.equal(groups([row({rowId:'test:1',parties}),row({rowId:'test:2',parties})]).length,2,'Incomplete party label must remain separate: '+parties);
  }
  assert.equal(core.unavailable('Names withheld for safeguarding'),true);
  assert.equal(core.partyTitle({parties:'Names withheld for safeguarding'}),'Party names unavailable in source');
});

test('date helpers handle years, leap years and IST date boundary', () => {
  assert.equal(core.addDays('2026-12-31',1),'2027-01-01');
  assert.equal(core.addDays('2024-02-28',1),'2024-02-29');
  assert.equal(core.addDays('2024-02-29',1),'2024-03-01');
  assert.equal(core.isoToday(new Date('2026-10-16T18:29:59Z')),'2026-10-16');
  assert.equal(core.isoToday(new Date('2026-10-16T18:30:00Z')),'2026-10-17');
});

test('whole source-projection placeholders do not become party identities',()=>{
  for(const parties of ['Party names not included in this source projection','Party names not stated in the supplied unmatched appendix','Not stated; prior history refers only to A2','[Not supplied]']){
    assert.equal(core.unavailable(parties),true,parties);
    assert.equal(core.partyTitle({parties}),'Party names unavailable in source');
    assert.equal(groups([row({rowId:'test:1',parties}),row({rowId:'test:2',parties})]).length,2);
  }
});

let failed=0;
for (const [name, fn] of tests) {
  try { fn(); console.log('PASS:', name); }
  catch (error) { failed++; console.error('FAIL:', name, '\n', error.message); }
}
if (failed) process.exitCode=1;
else console.log(`PASS: all ${tests.length} calendar-core regressions.`);
