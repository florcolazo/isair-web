const test = require('node:test');
const assert = require('node:assert/strict');

const { detectZone } = require('../src/coverage');

// Cuadrado de fibra de 0..10 con un hueco de 4..6
const square = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
const hole   = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]];

const features = [
  { properties: { zona: 'fibra' }, geometry: { type: 'Polygon', coordinates: [square, hole] } },
  { properties: { zona: 'inalambrica' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [30, 0], [30, 30], [0, 30], [0, 0]]] } },
];

test('detects fiber inside the fiber polygon', () => {
  assert.equal(detectZone(2, 2, features), 'fibra');
});

test('a hole in the fiber zone falls back to wireless', () => {
  assert.equal(detectZone(5, 5, features), 'inalambrica');
});

test('outside every zone has no coverage', () => {
  assert.equal(detectZone(50, 50, features), 'sin_cobertura');
});

test('supports MultiPolygon features', () => {
  const multi = [{
    properties: { zona: 'fibra' },
    geometry: { type: 'MultiPolygon', coordinates: [[square], [[[20, 20], [22, 20], [22, 22], [20, 22], [20, 20]]]] },
  }];
  assert.equal(detectZone(21, 21, multi), 'fibra');
  assert.equal(detectZone(15, 15, multi), 'sin_cobertura');
});
