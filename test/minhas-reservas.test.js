const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
// Uso o model de verdade, mas troco as funções que falam com o banco por funções falsas
const { Reserva } = require('../src/models');
let consultaLista; // guarda o que o findAll recebeu, para eu conferir depois
let consultaBusca; // guarda o que o findOne recebeu
const atualizacoes = []; // guarda os updates feitos
Reserva.findAll = async (q) => {
  consultaLista = q;
  return [{ id: 1, usuarioId: q.where.usuarioId, salaId: 1, status: 'ativa' }];
};
// Simulo que só existe a reserva 5 do usuário 7
Reserva.findOne = async (q) => {
  consultaBusca = q;
  const { id, usuarioId } = q.where;
  return Number(id) === 5 && usuarioId === 7 ? { update: async (d) => atualizacoes.push(d) } : null;
};

const app = require('../src/app');

test('GET e DELETE /api/reservas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  // Dois tokens: um do usuário 7 (dono da reserva) e outro do usuário 8 (outra pessoa)
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const outro = jwt.sign({ id: 8 }, 'segredo-de-teste');
  // Função auxiliar para chamar a API (se passar null no token, não envia o cabeçalho)
  const chamar = (metodo, caminho, tk = token) => fetch(`http://localhost:${server.address().port}/api/reservas${caminho}`, {
    method: metodo, headers: tk ? { Authorization: `Bearer ${tk}` } : {},
  });

  // Sem token tem que dar 401
  assert.strictEqual((await chamar('GET', '', null)).status, 401);
  assert.strictEqual((await chamar('DELETE', '/5', null)).status, 401);

  // Lista só as reservas do usuário que está no token
  const lista = await chamar('GET', '');
  assert.strictEqual(lista.status, 200);
  assert.strictEqual((await lista.json())[0].usuarioId, 7);
  assert.strictEqual(consultaLista.where.usuarioId, 7);

  // Cancela a própria reserva: 200 com mensagem e o status vira "cancelada"
  const ok = await chamar('DELETE', '/5');
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(await ok.json(), { mensagem: 'Reserva cancelada' });
  assert.deepStrictEqual(atualizacoes, [{ status: 'cancelada' }]);
  assert.deepStrictEqual(consultaBusca.where, { id: '5', usuarioId: 7 });

  // Reserva de outro usuário ou que não existe: 404 e nada é alterado
  assert.strictEqual((await chamar('DELETE', '/5', outro)).status, 404);
  assert.strictEqual((await chamar('DELETE', '/999')).status, 404);
  assert.strictEqual(atualizacoes.length, 1);
});
