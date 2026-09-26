const test = require('node:test');
const assert = require('node:assert');

// model real; só o acesso ao banco é substituído
const Sala = require('../src/models/Sala');
let falhar = false;
let consulta;
Sala.findAll = async (q) => {
  consulta = q;
  if (falhar) throw new Error('banco fora');
  return [{ id: 1, nome: 'Sala A', capacidade: 4 }, { id: 2, nome: 'Sala B', capacidade: 6 }];
};

const app = require('../src/app');

test('GET /api/salas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const get = () => fetch(`http://localhost:${server.address().port}/api/salas`);

  // rota pública: sem header Authorization
  const ok = await get();
  assert.strictEqual(ok.status, 200);
  const corpo = await ok.json();
  assert.strictEqual(corpo.length, 2);
  assert.strictEqual(corpo[0].nome, 'Sala A');
  assert.deepStrictEqual(consulta.order, [['id', 'ASC']]);

  falhar = true;
  assert.strictEqual((await get()).status, 500);
});
