const router = require('express').Router();
const { login, registrar } = require('../controllers/authController');
const handleValidation = require('../middlewares/handleValidation');
const { registerRules, loginRules } = require('../validators/authValidator');

router.post('/register', registerRules, handleValidation, registrar);
router.post('/login', loginRules, handleValidation, login);

module.exports = router;
