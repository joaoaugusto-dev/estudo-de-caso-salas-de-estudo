// Troco os models por objetos falsos (stubs); o teste confere o fluxo HTTP de criar e deletar sala
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const chamadas = []; // registra tudo que o controller chamou, na ordem
let salaExiste = true; // controla se a sala "existe" no teste
let reservaAtiva = false; // controla se existe reserva ativa na sala
const stubs = {
  // A transação falsa só executa a função passando 'tx' no lugar da transação
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
// Coloco os falsos no lugar do models/index.js antes de carregar o app
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

  // Sem token: 401 e nada foi chamado no "banco"
  assert.strictEqual((await post({ nome: 'Sala X', capacidade: 5 }, null)).status, 401);
  assert.strictEqual(chamadas.length, 0);

  // Dados inválidos (vazio, nome só com espaços, capacidade zero ou texto): 400 e nada foi salvo
  for (const invalido of [{}, { nome: '  ', capacidade: 5 }, { nome: 'Sala X', capacidade: 0 }, { nome: 'Sala X', capacidade: 'muitas' }]) {
    assert.strictEqual((await post(invalido)).status, 400);
  }
  assert.strictEqual(chamadas.length, 0);

  // Dados corretos: 201. O nome chega sem os espaços das pontas (trim do validator)
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
  chamadas.length = 0; // limpo o registro do teste anterior

  // Sem token: 401
  assert.strictEqual((await del(null)).status, 401);
  assert.strictEqual(chamadas.length, 0);

  // Sala que não existe: 404
  salaExiste = false;
  assert.strictEqual((await del()).status, 404);
  salaExiste = true;

  // Sala com reserva ativa: 409 e nenhum destroy pode ter sido chamado
  reservaAtiva = true;
  assert.strictEqual((await del()).status, 409);
  assert.ok(!chamadas.some(([nome]) => nome.endsWith('destroy')));
  reservaAtiva = false;
  chamadas.length = 0;

  // Tudo certo: 204, e a ordem tem que ser primeiro apagar as reservas e depois a sala,
  // as duas dentro da transação
  assert.strictEqual((await del()).status, 204);
  assert.deepStrictEqual(chamadas.slice(1), [
    ['Reserva.destroy', { where: { salaId: '3' }, transaction: 'tx' }],
    ['Sala.destroy', { where: { id: '3' }, transaction: 'tx' }],
  ]);
});
