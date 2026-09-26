const router = require('express').Router();

// Aqui eu junto todos os grupos de rotas, cada um com seu prefixo
router.use('/auth', require('./authRoutes')); // login e cadastro
router.use('/reservas', require('./reservaRoutes')); // reservas
router.use('/salas', require('./salaRoutes')); // salas
router.use('/usuarios', require('./usuarioRoutes')); // usuários
// Rota simples só para testar se a API está no ar
router.get('/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
