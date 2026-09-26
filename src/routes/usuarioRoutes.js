const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const { deletarMinhaConta } = require('../controllers/usuarioController');

// DELETE /api/usuarios/me -> o usuário logado apaga a própria conta ("me" = eu mesmo, o id vem do token)
router.delete('/me', verifyToken, deletarMinhaConta);

module.exports = router;
