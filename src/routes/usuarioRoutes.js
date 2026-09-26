const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const { listar, deletarMinhaConta } = require('../controllers/usuarioController');

// GET /api/usuarios -> lista todos os usuários (protegida, nunca devolve a senha)
router.get('/', verifyToken, listar);

// DELETE /api/usuarios/me -> o usuário logado apaga a própria conta ("me" = eu mesmo, o id vem do token)
router.delete('/me', verifyToken, deletarMinhaConta);

module.exports = router;
