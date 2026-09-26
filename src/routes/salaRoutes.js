const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const handleValidation = require('../middlewares/handleValidation');
const { salaRules } = require('../validators/salaValidator');
const { listar, criar, deletar } = require('../controllers/salaController');

router.get('/', listar);
router.post('/', verifyToken, salaRules, handleValidation, criar);
router.delete('/:id', verifyToken, deletar);

module.exports = router;
