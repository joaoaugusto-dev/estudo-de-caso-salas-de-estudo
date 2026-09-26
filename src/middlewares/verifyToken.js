const jwt = require('jsonwebtoken');

// Middleware que protege as rotas: só deixa passar quem enviou um token JWT válido
module.exports = (req, res, next) => {
  // O token vem no cabeçalho Authorization no formato "Bearer <token>".
  // Separo pelo espaço para ficar com o tipo ("Bearer") e o token.
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  try {
    // Se não veio no formato certo, jogo um erro para cair no catch
    if (tipo !== 'Bearer' || !token) throw new Error('sem token');
    // Confiro se o token é válido (assinatura e validade) e guardo o id do usuário na requisição,
    // assim os controllers sabem quem está logado
    req.usuarioId = jwt.verify(token, process.env.JWT_SECRET).id;
    next(); // token ok, segue para o próximo passo
  } catch (e) {
    // Token faltando, errado ou expirado -> 401 (não autorizado)
    res.status(401).json({ erro: 'Token ausente ou inválido' });
  }
};
