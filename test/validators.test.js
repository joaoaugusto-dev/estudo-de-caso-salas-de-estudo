const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const handleValidation = require('../src/middlewares/handleValidation');
const { registerRules, loginRules } = require('../src/validators/authValidator');
const { reservaRules } = require('../src/validators/reservaValidator');

const app = express();
app.use(express.json());
app.post('/register', registerRules, handleValidation, (req, res) => res.json({ ok: true }));
app.post('/login', loginRules, handleValidation, (req, res) => res.json({ ok: true }));
app.post('/reserva', reservaRules, handleValidation, (req, res) => res.json({ ok: true }));

test('validators + handleValidation', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const post = async (rota, body) => {
    const r = await fetch(`http://localhost:${server.address().port}${rota}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return [r.status, await r.json()];
  };
  const reserva = { salaId: 1, horarioInicio: '2026-10-01T10:00:00', horarioFim: '2026-10-01T11:00:00' };

  assert.strictEqual((await post('/register', { nome: 'Ana', email: 'a@a.com', senha: '123456' }))[0], 200);
  assert.strictEqual((await post('/login', { email: 'a@a.com', senha: 'x' }))[0], 200);
  assert.strictEqual((await post('/reserva', reserva))[0], 200);

  const [status, corpo] = await post('/register', { nome: '', email: 'ruim', senha: '123' });
  assert.strictEqual(status, 400);
  assert.deepStrictEqual(corpo.detalhes.map((d) => d.campo).sort(), ['email', 'nome', 'senha']);

  assert.strictEqual((await post('/login', {}))[0], 400);
  assert.strictEqual((await post('/reserva', { ...reserva, horarioFim: '2026-10-01T09:00:00' }))[0], 400);
  assert.strictEqual((await post('/reserva', { ...reserva, horarioInicio: 'ontem' }))[0], 400);
  assert.strictEqual((await post('/reserva', { ...reserva, salaId: 'x' }))[0], 400);
});
