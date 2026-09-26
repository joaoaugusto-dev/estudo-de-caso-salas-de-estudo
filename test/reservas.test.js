// Aqui troco Sala e Reserva por objetos falsos (stubs) em memória.
// O teste confere o fluxo HTTP e a consulta que verifica conflito de horário.
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

process.env.JWT_SECRET = 'segredo-de-teste';
let consulta; // guarda a consulta de conflito para conferir depois
let conflito = null; // controla se o teste simula conflito (null = sem conflito)
const stubs = {
  // Só a sala de id 1 existe
  Sala: { findByPk: async (id) => (id === 1 ? { id } : null) },
  Reserva: {
    findOne: async (q) => ((consulta = q), conflito),
    create: async (d) => ({ id: 99, ...d }),
  },
};
// Coloco meus objetos falsos no lugar do models/index.js antes de carregar o app,
// assim o controller usa os falsos em vez do banco
const path = require.resolve('../src/models');
require.cache[path] = { id: path, filename: path, loaded: true, exports: stubs };

const app = require('../src/app');

test('POST /api/reservas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  // Função auxiliar que envia o POST e devolve [status, corpo]
  const post = async (body, auth = `Bearer ${token}`) => {
    const r = await fetch(`http://localhost:${server.address().port}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
      body: JSON.stringify(body),
    });
    return [r.status, await r.json()];
  };
  // Reserva válida de uma hora, usada como base nos testes
  const reserva = { salaId: 1, horarioInicio: '2026-10-01T10:00:00', horarioFim: '2026-10-01T11:00:00' };

  assert.strictEqual((await post(reserva, null))[0], 401); // sem token
  assert.strictEqual((await post(reserva, 'Bearer lixo'))[0], 401); // token inválido
  assert.strictEqual((await post({ ...reserva, horarioFim: '2026-10-01T09:00:00' }))[0], 400); // fim antes do início
  assert.strictEqual((await post({ ...reserva, salaId: 2 }))[0], 404); // sala que não existe

  // Reserva válida: 201
  const [status, corpo] = await post(reserva);
  assert.strictEqual(status, 201);
  assert.strictEqual(corpo.usuarioId, 7); // vem do token, não do body
  // Confiro se a consulta de conflito foi montada certinho
  assert.deepStrictEqual(consulta.where.horarioInicio, { [Op.lt]: reserva.horarioFim });
  assert.deepStrictEqual(consulta.where.horarioFim, { [Op.gt]: reserva.horarioInicio });
  assert.strictEqual(consulta.where.status, 'ativa');

  // Agora simulo que já existe uma reserva no horário: deve dar 409
  conflito = { id: 1 };
  assert.strictEqual((await post(reserva))[0], 409);
});
