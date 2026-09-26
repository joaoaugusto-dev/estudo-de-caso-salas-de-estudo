const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const { deletarMinhaConta } = require('../controllers/usuarioController');

router.delete('/me', verifyToken, deletarMinhaConta);

module.exports = router;
