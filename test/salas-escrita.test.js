// models substituídos por stubs; o teste confere o fluxo HTTP de criar e deletar sala
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const chamadas = [];
let salaExiste = true;
let reservaAtiva = false;
const stubs = {
  sequelize: { transaction: async (fn) => fn('tx') },
  Sala: {
    create: async (dados) => (chamadas.push(['Sala.create', dados]), { id: 9, ...dados }),
    findByPk: async (id) => (salaExiste ? { id } : null),
    destroy: async (q) => chamadas.push(['Sala.destroy', q]),
  },
  Reserva: {
    findOne: async (q) => (chamadas.push(['Reserva.findOne', q]), reservaAtiva ? { id: 1 } : null),
    destroy: async (q) => chamadas.push(['Reserva.destroy', q]),
  },
};
const path = require.resolve('../src/models');
require.cache[path] = { id: path, filename: path, loaded: true, exports: stubs };

const app = require('../src/app');
const token = jwt.sign({ id: 7 }, 'segredo-de-teste');

test('POST /api/salas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const post = (corpo, auth = `Bearer ${token}`) => fetch(`http://localhost:${server.address().port}/api/salas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
    body: JSON.stringify(corpo),
  });

  assert.strictEqual((await post({ nome: 'Sala X', capacidade: 5 }, null)).status, 401);
  assert.strictEqual(chamadas.length, 0);

  for (const invalido of [{}, { nome: '  ', capacidade: 5 }, { nome: 'Sala X', capacidade: 0 }, { nome: 'Sala X', capacidade: 'muitas' }]) {
    assert.strictEqual((await post(invalido)).status, 400);
  }
  assert.strictEqual(chamadas.length, 0);

  const ok = await post({ nome: ' Sala X ', capacidade: 5 });
  assert.strictEqual(ok.status, 201);
  assert.deepStrictEqual(await ok.json(), { id: 9, nome: 'Sala X', capacidade: 5 });
});

test('DELETE /api/salas/:id', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const del = (auth = `Bearer ${token}`) => fetch(`http://localhost:${server.address().port}/api/salas/3`, {
    method: 'DELETE', headers: auth ? { Authorization: auth } : {},
  });
  chamadas.length = 0;

  assert.strictEqual((await del(null)).status, 401);
  assert.strictEqual(chamadas.length, 0);

  salaExiste = false;
  assert.strictEqual((await del()).status, 404);
  salaExiste = true;

  reservaAtiva = true;
  assert.strictEqual((await del()).status, 409);
  assert.ok(!chamadas.some(([nome]) => nome.endsWith('destroy')));
  reservaAtiva = false;
  chamadas.length = 0;

  assert.strictEqual((await del()).status, 204);
  assert.deepStrictEqual(chamadas.slice(1), [
    ['Reserva.destroy', { where: { salaId: '3' }, transaction: 'tx' }],
    ['Sala.destroy', { where: { id: '3' }, transaction: 'tx' }],
  ]);
});
