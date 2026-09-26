const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
// models reais; só o acesso ao banco é substituído
const { Reserva } = require('../src/models');
let consultaLista;
let consultaBusca;
const atualizacoes = [];
Reserva.findAll = async (q) => {
  consultaLista = q;
  return [{ id: 1, usuarioId: q.where.usuarioId, salaId: 1, status: 'ativa' }];
};
// só a reserva 5 do usuário 7 existe
Reserva.findOne = async (q) => {
  consultaBusca = q;
  const { id, usuarioId } = q.where;
  return Number(id) === 5 && usuarioId === 7 ? { update: async (d) => atualizacoes.push(d) } : null;
};

const app = require('../src/app');

test('GET e DELETE /api/reservas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const outro = jwt.sign({ id: 8 }, 'segredo-de-teste');
  const chamar = (metodo, caminho, tk = token) => fetch(`http://localhost:${server.address().port}/api/reservas${caminho}`, {
    method: metodo, headers: tk ? { Authorization: `Bearer ${tk}` } : {},
  });

  // sem token
  assert.strictEqual((await chamar('GET', '', null)).status, 401);
  assert.strictEqual((await chamar('DELETE', '/5', null)).status, 401);

  // lista só as reservas do usuário do token
  const lista = await chamar('GET', '');
  assert.strictEqual(lista.status, 200);
  assert.strictEqual((await lista.json())[0].usuarioId, 7);
  assert.strictEqual(consultaLista.where.usuarioId, 7);

  // cancela a própria reserva
  const ok = await chamar('DELETE', '/5');
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(await ok.json(), { mensagem: 'Reserva cancelada' });
  assert.deepStrictEqual(atualizacoes, [{ status: 'cancelada' }]);
  assert.deepStrictEqual(consultaBusca.where, { id: '5', usuarioId: 7 });

  // reserva de outro usuário ou inexistente: 404 e nada é alterado
  assert.strictEqual((await chamar('DELETE', '/5', outro)).status, 404);
  assert.strictEqual((await chamar('DELETE', '/999')).status, 404);
  assert.strictEqual(atualizacoes.length, 1);
});
