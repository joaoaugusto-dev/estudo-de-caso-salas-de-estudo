const test = require('node:test');
const assert = require('node:assert');

// Uso o model de verdade, mas troco o findAll por uma função falsa (sem banco)
const Sala = require('../src/models/Sala');
let falhar = false; // quando true, simulo o banco fora do ar
let consulta; // guarda o que o findAll recebeu
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

  // Rota pública: chamo sem o cabeçalho Authorization e tem que funcionar
  const ok = await get();
  assert.strictEqual(ok.status, 200);
  const corpo = await ok.json();
  assert.strictEqual(corpo.length, 2);
  assert.strictEqual(corpo[0].nome, 'Sala A');
  // Confiro que pediu ordenado pelo id
  assert.deepStrictEqual(consulta.order, [['id', 'ASC']]);

  // Se o banco falhar, a API responde 500
  falhar = true;
  assert.strictEqual((await get()).status, 500);
});
