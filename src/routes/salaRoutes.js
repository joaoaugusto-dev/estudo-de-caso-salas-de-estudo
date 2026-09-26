const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const handleValidation = require('../middlewares/handleValidation');
const { salaRules } = require('../validators/salaValidator');
const { listar, criar, deletar } = require('../controllers/salaController');

// GET /api/salas -> lista as salas (pública, não precisa de token)
router.get('/', listar);
// POST /api/salas -> cria sala (precisa estar logado e os dados são validados)
router.post('/', verifyToken, salaRules, handleValidation, criar);
// DELETE /api/salas/:id -> apaga uma sala pelo id (precisa estar logado)
router.delete('/:id', verifyToken, deletar);

module.exports = router;
