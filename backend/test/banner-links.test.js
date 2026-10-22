const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeBannerLink } = require('../src/banner-links');

test('keeps an internal form link', () => {
  assert.equal(normalizeBannerLink('#formulario'), '#formulario');
});

test('trims an external banner link', () => {
  assert.equal(normalizeBannerLink(' https://example.com/promo '), 'https://example.com/promo');
});

test('stores an omitted banner link as null', () => {
  assert.equal(normalizeBannerLink(), null);
  assert.equal(normalizeBannerLink('   '), null);
});
