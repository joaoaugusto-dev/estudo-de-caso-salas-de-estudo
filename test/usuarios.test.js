// Troco os models por objetos falsos (stubs); o teste confere o fluxo HTTP e
// se as reservas e o usuário são apagados na mesma transação
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const chamadas = []; // registra as chamadas na ordem em que aconteceram
let existe = true; // controla se o usuário "existe" no teste
const stubs = {
  // Transação falsa: só executa a função passando 'tx'
  sequelize: { transaction: async (fn) => fn('tx') },
  Reserva: { destroy: async (q) => chamadas.push(['Reserva', q]) },
  // destroy devolve 1 (apagou) ou 0 (não achou), igual o Sequelize faz
  Usuario: { findAll: async (q) => (chamadas.push(['findAll', q]), [{ id: 1, nome: 'Ana', email: 'a@a.com' }]), destroy: async (q) => (chamadas.push(['Usuario', q]), existe ? 1 : 0) },
};
const path = require.resolve('../src/models');
require.cache[path] = { id: path, filename: path, loaded: true, exports: stubs };

const app = require('../src/app');

test('DELETE /api/usuarios/me', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const del = (auth = `Bearer ${token}`) => fetch(`http://localhost:${server.address().port}/api/usuarios/me`, {
    method: 'DELETE', headers: auth ? { Authorization: auth } : {},
  });

  // Sem token ou com token inválido: 401 e nada é apagado
  assert.strictEqual((await del(null)).status, 401);
  assert.strictEqual((await del('Bearer lixo')).status, 401);
  assert.strictEqual(chamadas.length, 0);

  // Com token válido: 200 com mensagem, apagando primeiro as reservas e depois o usuário (id 7 vindo do token)
  const ok = await del();
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(await ok.json(), { mensagem: 'Conta excluída' });
  assert.deepStrictEqual(chamadas, [
    ['Reserva', { where: { usuarioId: 7 }, transaction: 'tx' }],
    ['Usuario', { where: { id: 7 }, transaction: 'tx' }],
  ]);

  // Se o usuário não existir mais: 404
  existe = false;
  assert.strictEqual((await del()).status, 404);
});

test('GET /api/usuarios', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const url = `http://localhost:${server.address().port}/api/usuarios`;

  // Sem token: 401
  assert.strictEqual((await fetch(url)).status, 401);

  // Com token: 200 e a consulta pede só id, nome e email (sem senha)
  chamadas.length = 0;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt.sign({ id: 7 }, 'segredo-de-teste')}` } });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), [{ id: 1, nome: 'Ana', email: 'a@a.com' }]);
  assert.deepStrictEqual(chamadas[0][1].attributes, ['id', 'nome', 'email']);
});
