// body() diz qual campo do corpo da requisição eu quero validar
const { body } = require('express-validator');

// Criei email e senha como funções porque o express-validator altera a regra quando encadeio métodos,
// então não posso compartilhar o mesmo objeto entre registro e login.
// Email precisa ser válido e é normalizado (ex: deixa em minúsculo).
const email = () => body('email').isEmail().withMessage('Email inválido').normalizeEmail();
// Senha precisa ser texto e não pode ser vazia
// bail: se já não for texto, para na primeira mensagem (evita duas mensagens de erro no mesmo campo)
const senha = () => body('senha').isString().withMessage('Senha é obrigatória').bail().notEmpty().withMessage('Senha é obrigatória');

// Regras do cadastro: nome obrigatório, email válido e senha com no mínimo 6 caracteres
exports.registerRules = [
  body('nome').isString().withMessage('Nome é obrigatório').bail().trim().notEmpty().withMessage('Nome é obrigatório'),
  email(),
  senha().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

// Regras do login: só email válido e senha preenchida
exports.loginRules = [email(), senha()];
