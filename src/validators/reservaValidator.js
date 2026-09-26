const { body } = require('express-validator');

exports.reservaRules = [
  body('salaId').isInt({ min: 1 }).withMessage('salaId inválido'),
  body('horarioInicio').isISO8601().withMessage('horarioInicio deve ser uma data/hora ISO 8601'),
  body('horarioFim')
    .isISO8601().withMessage('horarioFim deve ser uma data/hora ISO 8601')
    .bail()
    .custom((fim, { req }) => new Date(fim) > new Date(req.body.horarioInicio))
    .withMessage('horarioFim deve ser posterior a horarioInicio'),
];
