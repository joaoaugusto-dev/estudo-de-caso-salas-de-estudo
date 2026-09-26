// Usuario (issue #7) ainda não existe: o model é substituído por um stub em memória.
const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'segredo-de-teste';
const senha = bcrypt.hashSync('123456', 4);
const path = require.resolve('../src/models/Usuario');
require.cache[path] = {
  id: path, filename: path, loaded: true,
  exports: { findOne: async ({ where }) => (where.email === 'a@a.com' ? { id: 7, senha } : null) },
};

const app = require('../src/app');

test('POST /api/auth/login', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const post = (body) => fetch(`http://localhost:${server.address().port}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

  const ok = await post({ email: 'a@a.com', senha: '123456' });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(jwt.verify((await ok.json()).token, 'segredo-de-teste').id, 7);

  for (const body of [{ email: 'a@a.com', senha: 'errada' }, { email: 'x@x.com', senha: '123456' }, {}]) {
    assert.strictEqual((await post(body)).status, 401);
  }
});
