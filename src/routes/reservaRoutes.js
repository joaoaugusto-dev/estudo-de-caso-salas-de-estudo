const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const handleValidation = require('../middlewares/handleValidation');
const { reservaRules } = require('../validators/reservaValidator');
const { criar } = require('../controllers/reservaController');

router.post('/', verifyToken, reservaRules, handleValidation, criar);

module.exports = router;
