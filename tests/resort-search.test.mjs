import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveResortSearch } from '../data/resorts.ts';

test('recognizes explicit natural resort aliases', () => {
  const aliases = [
    ['Heavenly Resort', '/resorts/heavenly'],
    ['Heavenly Mountain Resort', '/resorts/heavenly'],
    ['Palisades Tahoe Resort', '/resorts/palisades-tahoe'],
    ['Northstar California Resort', '/resorts/northstar-california'],
    ['Northstar Resort', '/resorts/northstar-california'],
    ['Kirkwood Mountain Resort', '/resorts/kirkwood'],
    ['Mammoth Mountain Resort', '/resorts/mammoth-mountain'],
    ['  MAMMOTH-MOUNTAIN  ', '/resorts/mammoth-mountain'],
  ];

  for (const [query, route] of aliases) {
    assert.equal(resolveResortSearch(query)?.route, route);
  }
});

test('does not accept ambiguous partial matches', () => {
  for (const query of ['Tahoe', 'California', 'Mountain Resort', 'Heavenly Valley', 'Palisades Mountain']) {
    assert.equal(resolveResortSearch(query), null);
  }
});

test('returns an explicit support state with every supported resort', () => {
  assert.equal(resolveResortSearch('Heavenly')?.supportState, 'full-map');
  assert.equal(resolveResortSearch('Palisades')?.supportState, 'preview');
  assert.equal(resolveResortSearch('Northstar')?.supportState, 'preview');
  assert.equal(resolveResortSearch('Kirkwood')?.supportState, 'preview');
  assert.equal(resolveResortSearch('Mammoth')?.supportState, 'preview');
});
