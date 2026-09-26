const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');

const criados = [];
// model real; só o acesso ao banco é substituído
const Usuario = require('../src/models/Usuario');
Usuario.findOne = async ({ where }) => (where.email === 'existe@a.com' ? { id: 1 } : null);
Usuario.create = async (dados) => { criados.push(dados); return { id: 9, ...dados }; };

const app = require('../src/app');

test('POST /api/auth/register', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const post = (body) => fetch(`http://localhost:${server.address().port}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

  const ok = await post({ nome: 'Ana', email: 'ana@a.com', senha: '123456' });
  assert.strictEqual(ok.status, 201);
  assert.deepStrictEqual(await ok.json(), { id: 9, nome: 'Ana', email: 'ana@a.com' });
  assert.notStrictEqual(criados[0].senha, '123456');
  assert.ok(await bcrypt.compare('123456', criados[0].senha));

  const dup = await post({ nome: 'Ana', email: 'existe@a.com', senha: '123456' });
  assert.strictEqual(dup.status, 409);

  for (const body of [{}, { nome: 'Ana', email: 'invalido', senha: '123456' }, { nome: 'Ana', email: 'b@a.com', senha: '123' }]) {
    assert.strictEqual((await post(body)).status, 400);
  }
  assert.strictEqual(criados.length, 1);
});
