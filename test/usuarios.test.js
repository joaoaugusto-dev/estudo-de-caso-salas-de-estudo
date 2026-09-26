// models substituídos por stubs; o teste confere o fluxo HTTP e que reservas e usuário são apagados na mesma transação
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const chamadas = [];
let existe = true;
const stubs = {
  sequelize: { transaction: async (fn) => fn('tx') },
  Reserva: { destroy: async (q) => chamadas.push(['Reserva', q]) },
  Usuario: { destroy: async (q) => (chamadas.push(['Usuario', q]), existe ? 1 : 0) },
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

  assert.strictEqual((await del(null)).status, 401);
  assert.strictEqual((await del('Bearer lixo')).status, 401);
  assert.strictEqual(chamadas.length, 0);

  assert.strictEqual((await del()).status, 204);
  assert.deepStrictEqual(chamadas, [
    ['Reserva', { where: { usuarioId: 7 }, transaction: 'tx' }],
    ['Usuario', { where: { id: 7 }, transaction: 'tx' }],
  ]);

  existe = false;
  assert.strictEqual((await del()).status, 404);
});
