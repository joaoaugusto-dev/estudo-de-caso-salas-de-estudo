const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const erros = validationResult(req);
  if (erros.isEmpty()) return next();
  res.status(400).json({
    erro: 'Dados inválidos',
    detalhes: erros.array().map(({ path, msg }) => ({ campo: path, mensagem: msg })),
  });
};
