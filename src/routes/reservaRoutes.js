const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const handleValidation = require('../middlewares/handleValidation');
const { reservaRules } = require('../validators/reservaValidator');
const { criar, listarMinhas, cancelar } = require('../controllers/reservaController');

// Todas as rotas de reserva exigem login (verifyToken)

// GET /api/reservas -> lista as reservas do usuário logado
router.get('/', verifyToken, listarMinhas);
// POST /api/reservas -> cria uma reserva (valida os dados antes)
router.post('/', verifyToken, reservaRules, handleValidation, criar);
// DELETE /api/reservas/:id -> cancela uma reserva pelo id
router.delete('/:id', verifyToken, cancelar);

module.exports = router;
