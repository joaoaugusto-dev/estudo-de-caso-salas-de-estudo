// Uso o test runner e o assert que já vêm no Node, sem instalar nada
const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Segredo falso só para os testes
process.env.JWT_SECRET = 'segredo-de-teste';
// Crio o hash da senha "123456" (o 4 é só para ficar rápido no teste)
const senha = bcrypt.hashSync('123456', 4);
// Troco o findOne do model por uma função falsa, assim não preciso de banco de verdade:
// só o email a@a.com "existe" (usuário com id 7)
require('../src/models/Usuario').findOne = async ({ where }) => (where.email === 'a@a.com' ? { id: 7, senha } : null);

const app = require('../src/app');

test('POST /api/auth/login', async (t) => {
  // Sobe o servidor numa porta livre (0 = o sistema escolhe) e fecha quando o teste acabar
  const server = app.listen(0);
  t.after(() => server.close());
  // Função auxiliar para enviar o POST de login
  const post = (body) => fetch(`http://localhost:${server.address().port}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

  // Login correto: deve dar 200 e o token deve ter o id 7 dentro
  const ok = await post({ email: 'a@a.com', senha: '123456' });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(jwt.verify((await ok.json()).token, 'segredo-de-teste').id, 7);

  // Senha errada ou email que não existe: deve dar 401
  for (const body of [{ email: 'a@a.com', senha: 'errada' }, { email: 'x@x.com', senha: '123456' }]) {
    assert.strictEqual((await post(body)).status, 401);
  }

  // Dados inválidos (vazio, email mal formado, sem senha) são barrados pelo validator com 400,
  // antes mesmo de consultar o banco
  for (const body of [{}, { email: 'nao-e-email', senha: '123456' }, { email: 'a@a.com' }]) {
    assert.strictEqual((await post(body)).status, 400);
  }
});
