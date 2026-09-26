const router = require('express').Router();
const { login, registrar } = require('../controllers/authController');
const handleValidation = require('../middlewares/handleValidation');
const { registerRules, loginRules } = require('../validators/authValidator');

// A ordem importa: primeiro valida os campos (rules), depois vê se teve erro (handleValidation),
// e só então chama o controller.

// POST /api/auth/register -> cadastra um usuário novo
router.post('/register', registerRules, handleValidation, registrar);
// POST /api/auth/login -> faz login e devolve o token
router.post('/login', loginRules, handleValidation, login);

module.exports = router;
