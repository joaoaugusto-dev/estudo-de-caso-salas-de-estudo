const router = require('express').Router();
const { login, registrar } = require('../controllers/authController');
const handleValidation = require('../middlewares/handleValidation');
const { registerRules } = require('../validators/authValidator');

router.post('/register', registerRules, handleValidation, registrar);
router.post('/login', login);

module.exports = router;
