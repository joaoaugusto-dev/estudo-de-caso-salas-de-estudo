// Sala/Reserva são substituídas por stubs em memória; o teste confere o fluxo HTTP e a query de conflito.
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

process.env.JWT_SECRET = 'segredo-de-teste';
let consulta;
let conflito = null;
const stubs = {
  Sala: { findByPk: async (id) => (id === 1 ? { id } : null) },
  Reserva: {
    findOne: async (q) => ((consulta = q), conflito),
    create: async (d) => ({ id: 99, ...d }),
  },
};
const path = require.resolve('../src/models');
require.cache[path] = { id: path, filename: path, loaded: true, exports: stubs };

const app = require('../src/app');

test('POST /api/reservas', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 7 }, 'segredo-de-teste');
  const post = async (body, auth = `Bearer ${token}`) => {
    const r = await fetch(`http://localhost:${server.address().port}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
      body: JSON.stringify(body),
    });
    return [r.status, await r.json()];
  };
  const reserva = { salaId: 1, horarioInicio: '2026-10-01T10:00:00', horarioFim: '2026-10-01T11:00:00' };

  assert.strictEqual((await post(reserva, null))[0], 401);
  assert.strictEqual((await post(reserva, 'Bearer lixo'))[0], 401);
  assert.strictEqual((await post({ ...reserva, horarioFim: '2026-10-01T09:00:00' }))[0], 400);
  assert.strictEqual((await post({ ...reserva, salaId: 2 }))[0], 404);

  const [status, corpo] = await post(reserva);
  assert.strictEqual(status, 201);
  assert.strictEqual(corpo.usuarioId, 7); // vem do token, não do body
  assert.deepStrictEqual(consulta.where.horarioInicio, { [Op.lt]: reserva.horarioFim });
  assert.deepStrictEqual(consulta.where.horarioFim, { [Op.gt]: reserva.horarioInicio });
  assert.strictEqual(consulta.where.status, 'ativa');

  conflito = { id: 1 };
  assert.strictEqual((await post(reserva))[0], 409);
});
