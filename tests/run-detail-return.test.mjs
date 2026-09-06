import assert from 'node:assert/strict';
import test from 'node:test';
import { getRunDetailReturn, parseRunDetailOrigin } from '../navigation/runDetailReturn.ts';

test('Heavenly-origin details return through history when context exists', () => {
  assert.deepEqual(getRunDetailReturn('heavenly', true), {
    label: 'Back to Heavenly',
    destination: '/resorts/heavenly',
    useHistory: true,
  });
});

test('homepage-origin details use a truthful homepage label and fallback', () => {
  assert.deepEqual(getRunDetailReturn('home', true), {
    label: 'Back to Flurra home',
    destination: '/',
    useHistory: true,
  });
  assert.deepEqual(getRunDetailReturn('home', false), {
    label: 'Back to Flurra home',
    destination: '/',
    useHistory: false,
  });
});

test('direct-entry details always use a reliable Heavenly destination', () => {
  assert.deepEqual(getRunDetailReturn(undefined, true), {
    label: 'Back to Heavenly',
    destination: '/resorts/heavenly',
    useHistory: false,
  });
  assert.equal(parseRunDetailOrigin('unexpected'), undefined);
});

test('Heavenly origin falls back to the resort when no history exists', () => {
  assert.deepEqual(getRunDetailReturn(parseRunDetailOrigin(['heavenly']), false), {
    label: 'Back to Heavenly',
    destination: '/resorts/heavenly',
    useHistory: false,
  });
});
