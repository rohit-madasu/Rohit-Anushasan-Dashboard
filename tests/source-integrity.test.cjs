'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline-invariants.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const sandbox = {window: {}};
vm.runInNewContext(raw, sandbox);
const data = sandbox.window.HEARING_DATA;
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
for (const [key, expected] of Object.entries(baseline.fields)) {
  assert.equal(sha256(JSON.stringify(data[key])), expected.sha256, key + ': baseline source facts changed');
  if (expected.count !== null) assert.equal(data[key].length, expected.count);
}
assert.equal(data.sourceDocumentSha256, baseline.sourceDocumentSha256);
assert.equal(data.sourcePdfSha256, baseline.sourcePdfSha256);
assert.equal(data.historyRows.filter(row => row.historyOnly !== true).length, 0);
for (const row of data.historyRows) {
  assert(row.rowId && row.sources && row.sources.length, 'Every retained event needs source provenance');
  for (const source of row.sources) assert(source.eventId && source.evidenceObjectSha256, 'Evidence identity and hash are required');
}
console.log('PASS: source arrays, historical provenance, tracking exclusions, and document bindings are unchanged.');
