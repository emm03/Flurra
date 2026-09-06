import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveResortSearch } from '../data/resortSearch.ts';

test('recognizes explicit natural resort aliases', () => {
  const aliases = [
    ['Heavenly Resort', '/resorts/heavenly'],
    ['Heavenly Mountain Resort', '/resorts/heavenly'],
    ['Palisades Tahoe Resort', '/resorts/palisades-tahoe'],
    ['Mammoth Mountain Resort', '/resorts/mammoth-mountain'],
    ['  MAMMOTH-MOUNTAIN  ', '/resorts/mammoth-mountain'],
  ];

  for (const [query, route] of aliases) {
    assert.equal(resolveResortSearch(query)?.route, route);
  }
});

test('does not accept ambiguous partial matches', () => {
  for (const query of ['Tahoe', 'Mountain Resort', 'Heavenly Valley', 'Palisades Mountain']) {
    assert.equal(resolveResortSearch(query), null);
  }
});
