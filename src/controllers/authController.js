const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = email && senha && (await Usuario.findOne({ where: { email } }));
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (await Usuario.findOne({ where: { email } })) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    const hash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senha: hash });
    res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
