const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  try {
    if (tipo !== 'Bearer' || !token) throw new Error('sem token');
    req.usuarioId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch (e) {
    res.status(401).json({ erro: 'Token ausente ou inválido' });
  }
};
