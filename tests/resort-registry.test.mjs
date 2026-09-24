import assert from 'node:assert/strict';
import test from 'node:test';
import { resortRegistry, validateResortRegistry } from '../data/resorts.ts';

test('contains the five-resort beta with stable unique identities', () => {
  assert.deepEqual(
    resortRegistry.map((resort) => resort.id),
    ['heavenly', 'palisades-tahoe', 'northstar-california', 'kirkwood', 'mammoth-mountain'],
  );
  assert.equal(new Set(resortRegistry.map((resort) => resort.id)).size, resortRegistry.length);
  assert.equal(new Set(resortRegistry.map((resort) => resort.slug)).size, resortRegistry.length);
  assert.deepEqual(validateResortRegistry(), []);
});

test('publishes full interactive geometry only for Heavenly', () => {
  const fullMapResorts = resortRegistry.filter((resort) => resort.capabilities.map === 'full-map');
  assert.deepEqual(fullMapResorts.map((resort) => resort.id), ['heavenly']);
  assert.equal(fullMapResorts[0].ingestion.geometryStatus, 'verified-local-snapshot');

  for (const resort of resortRegistry.filter((item) => item.id !== 'heavenly')) {
    assert.equal(resort.supportState, 'preview');
    assert.equal(resort.capabilities.map, 'map-data-in-progress');
    assert.equal(resort.capabilities.trails, 'not-imported');
    assert.equal(resort.ingestion.geometryStatus, 'not-imported');
  }
});

test('keeps official fact provenance and photo rights attached', () => {
  for (const resort of resortRegistry) {
    const sourceIds = new Set(resort.sources.map((source) => source.id));
    for (const fact of Object.values(resort.facts)) {
      assert.equal(sourceIds.has(fact.sourceId), true, `${resort.id}: missing source for ${fact.label}`);
      assert.equal(fact.verificationStatus, 'official-published');
    }

    assert.equal(resort.heroImage.resortId, resort.id);
    assert.equal(resort.heroImage.usageStatus, 'verified-reusable');
    if (resort.heroImage.kind === 'verified-photo') {
      assert.ok(resort.heroImage.creator);
      assert.ok(resort.heroImage.creditLine);
      assert.ok(resort.heroImage.licenseLabel);
      assert.ok(resort.heroImage.licenseUrl.startsWith('https://'));
      assert.ok(resort.heroImage.sourceUrl.startsWith('https://commons.wikimedia.org/'));
    }
  }
});
