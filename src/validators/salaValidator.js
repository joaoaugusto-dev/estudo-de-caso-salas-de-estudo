const { body } = require('express-validator');

// Regras para criar uma sala
exports.salaRules = [
  // nome: precisa ser texto, sem espaços nas pontas (trim) e não pode ficar vazio
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  // capacidade: número inteiro maior que zero
  body('capacidade').isInt({ min: 1 }).withMessage('Capacidade deve ser um inteiro maior que zero'),
];
