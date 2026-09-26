const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');

const criados = []; // guarda os usuários "criados" para eu conferir depois
// Uso o model de verdade, mas troco o acesso ao banco por funções falsas
const Usuario = require('../src/models/Usuario');
// Simulo que o email existe@a.com já está cadastrado
Usuario.findOne = async ({ where }) => (where.email === 'existe@a.com' ? { id: 1 } : null);
// Em vez de salvar no banco, só guardo na lista e devolvo com id 9
Usuario.create = async (dados) => { criados.push(dados); return { id: 9, ...dados }; };

const app = require('../src/app');

test('POST /api/auth/register', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const post = (body) => fetch(`http://localhost:${server.address().port}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

  // Cadastro correto: 201 e a resposta não mostra a senha
  const ok = await post({ nome: 'Ana', email: 'ana@a.com', senha: '123456' });
  assert.strictEqual(ok.status, 201);
  assert.deepStrictEqual(await ok.json(), { id: 9, nome: 'Ana', email: 'ana@a.com' });
  // A senha salva não pode ser a original, tem que ser o hash dela
  assert.notStrictEqual(criados[0].senha, '123456');
  assert.ok(await bcrypt.compare('123456', criados[0].senha));

  // Email que já existe: 409
  const dup = await post({ nome: 'Ana', email: 'existe@a.com', senha: '123456' });
  assert.strictEqual(dup.status, 409);

  // Dados inválidos (vazio, email ruim, senha curta): 400
  for (const body of [{}, { nome: 'Ana', email: 'invalido', senha: '123456' }, { nome: 'Ana', email: 'b@a.com', senha: '123' }]) {
    assert.strictEqual((await post(body)).status, 400);
  }
  // No fim, só um usuário foi realmente criado (o primeiro)
  assert.strictEqual(criados.length, 1);
});
