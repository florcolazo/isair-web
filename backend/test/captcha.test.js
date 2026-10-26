const test = require('node:test');
const assert = require('node:assert/strict');

const { crearLimiteLogin } = require('../src/middleware/captcha');

// Respuesta mínima de Express para capturar status y cuerpo
function respuesta() {
  return {
    statusCode: 200, body: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
}

function pasa(mw, ip) {
  let siguio = false;
  const res = respuesta();
  mw({ ip }, res, () => { siguio = true; });
  return { siguio, res };
}

test('blocks an IP after reaching the failure limit', () => {
  const mw = crearLimiteLogin({ max: 3 });
  for (let i = 0; i < 3; i++) {
    assert.equal(pasa(mw, '1.1.1.1').siguio, true);
    mw.fallo('1.1.1.1');
  }
  const { siguio, res } = pasa(mw, '1.1.1.1');
  assert.equal(siguio, false);
  assert.equal(res.statusCode, 429);
});

test('other IPs are not affected', () => {
  const mw = crearLimiteLogin({ max: 1 });
  mw.fallo('1.1.1.1');
  assert.equal(pasa(mw, '2.2.2.2').siguio, true);
});

test('a successful login clears the failures', () => {
  const mw = crearLimiteLogin({ max: 2 });
  mw.fallo('1.1.1.1');
  mw.exito('1.1.1.1');
  mw.fallo('1.1.1.1');
  assert.equal(pasa(mw, '1.1.1.1').siguio, true);
});

test('the block expires after the window', () => {
  let t = 0;
  const mw = crearLimiteLogin({ max: 1, ventanaMs: 1000, ahora: () => t });
  mw.fallo('1.1.1.1');
  assert.equal(pasa(mw, '1.1.1.1').siguio, false);
  t = 1001;
  assert.equal(pasa(mw, '1.1.1.1').siguio, true);
});
