// validationResult pega os erros que as regras (validators) encontraram na requisição
const { validationResult } = require('express-validator');

// Middleware que roda depois das regras de validação e antes do controller
module.exports = (req, res, next) => {
  const erros = validationResult(req);
  // Se não teve nenhum erro, deixo a requisição seguir para o controller
  if (erros.isEmpty()) return next();
  // Se teve erro, paro aqui e devolvo 400 (requisição inválida) listando cada campo com problema
  res.status(400).json({
    erro: 'Dados inválidos',
    detalhes: erros.array().map(({ path, msg }) => ({ campo: path, mensagem: msg })),
  });
};
