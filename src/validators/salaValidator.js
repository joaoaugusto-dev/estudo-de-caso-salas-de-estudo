const { body } = require('express-validator');

exports.salaRules = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  body('capacidade').isInt({ min: 1 }).withMessage('Capacidade deve ser um inteiro maior que zero'),
];
