const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const handleValidation = require('../middlewares/handleValidation');
const { reservaRules } = require('../validators/reservaValidator');
const { criar, listarMinhas, cancelar } = require('../controllers/reservaController');

router.get('/', verifyToken, listarMinhas);
router.post('/', verifyToken, reservaRules, handleValidation, criar);
router.delete('/:id', verifyToken, cancelar);

module.exports = router;
