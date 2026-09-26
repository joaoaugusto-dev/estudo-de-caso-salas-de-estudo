const { body } = require('express-validator');

// funções: as chains do express-validator são mutáveis e não podem ser compartilhadas
const email = () => body('email').isEmail().withMessage('Email inválido').normalizeEmail();
const senha = () => body('senha').isString().notEmpty().withMessage('Senha é obrigatória');

exports.registerRules = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  email(),
  senha().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

exports.loginRules = [email(), senha()];
