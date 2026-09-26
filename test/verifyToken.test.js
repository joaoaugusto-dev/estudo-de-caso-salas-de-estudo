const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const verifyToken = require('../src/middlewares/verifyToken');

// Função auxiliar: executa o middleware com um cabeçalho Authorization e devolve o que ele fez.
// Crio um req e um res falsos só com o que o middleware usa (headers, status e json).
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

// Token certo: deixa passar (chama next) e guarda o id do usuário no req
test('token válido anexa req.usuarioId e chama next', () => {
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const r = rodar(`Bearer ${token}`);
  assert.strictEqual(r.chamouNext, true);
  assert.strictEqual(r.req.usuarioId, 7);
  assert.strictEqual(r.status, undefined);
});

// Cabeçalho faltando ou no formato errado: 401 e não deixa passar
test('retorna 401 para token ausente ou malformado', () => {
  for (const header of [undefined, '', 'Bearer', 'Bearer ', 'abc.def.ghi', 'Basic abc']) {
    const r = rodar(header);
    assert.strictEqual(r.status, 401, `header: ${header}`);
    assert.strictEqual(r.chamouNext, false);
    assert.strictEqual(r.req.usuarioId, undefined);
  }
});

// Token falso, assinado com outro segredo ou já vencido: também 401
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
