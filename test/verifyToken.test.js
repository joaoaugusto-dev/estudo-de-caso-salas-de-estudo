const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const verifyToken = require('../src/middlewares/verifyToken');

// executa o middleware com um header Authorization e devolve o que ele fez
const rodar = (authorization) => {
  const req = { headers: authorization === undefined ? {} : { authorization } };
  const saida = { chamouNext: false };
  const res = {
    status(codigo) { saida.status = codigo; return this; },
    json(corpo) { saida.corpo = corpo; return this; },
  };
  verifyToken(req, res, () => { saida.chamouNext = true; });
  return { req, ...saida };
};

test('token válido anexa req.usuarioId e chama next', () => {
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const r = rodar(`Bearer ${token}`);
  assert.strictEqual(r.chamouNext, true);
  assert.strictEqual(r.req.usuarioId, 7);
  assert.strictEqual(r.status, undefined);
});

test('retorna 401 para token ausente ou malformado', () => {
  for (const header of [undefined, '', 'Bearer', 'Bearer ', 'abc.def.ghi', 'Basic abc']) {
    const r = rodar(header);
    assert.strictEqual(r.status, 401, `header: ${header}`);
    assert.strictEqual(r.chamouNext, false);
    assert.strictEqual(r.req.usuarioId, undefined);
  }
});

test('retorna 401 para token inválido, assinado com outro segredo ou expirado', () => {
  const outroSegredo = jwt.sign({ id: 7 }, 'outro-segredo');
  const expirado = jwt.sign({ id: 7 }, 'segredo-de-teste', { expiresIn: -10 });
  for (const token of ['lixo', outroSegredo, expirado]) {
    const r = rodar(`Bearer ${token}`);
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.chamouNext, false);
    assert.strictEqual(r.req.usuarioId, undefined);
  }
});
