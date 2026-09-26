const { body } = require('express-validator');

// Regras para criar uma reserva
exports.reservaRules = [
  // salaId tem que ser um número inteiro de 1 para cima
  body('salaId').isInt({ min: 1 }).withMessage('salaId inválido'),
  // horarioInicio tem que ser uma data no formato ISO 8601 (ex: 2026-10-01T10:00:00Z)
  body('horarioInicio').isISO8601().withMessage('horarioInicio deve ser uma data/hora ISO 8601'),
  body('horarioFim')
    .isISO8601().withMessage('horarioFim deve ser uma data/hora ISO 8601')
    // bail: se a data já estiver inválida, para aqui e não roda a regra de baixo
    .bail()
    // regra personalizada: o fim precisa ser depois do início
    .custom((fim, { req }) => new Date(fim) > new Date(req.body.horarioInicio))
    .withMessage('horarioFim deve ser posterior a horarioInicio'),
];
