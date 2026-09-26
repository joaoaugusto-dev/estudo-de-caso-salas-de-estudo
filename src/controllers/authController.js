// bcrypt: serve para criptografar a senha e comparar depois
const bcrypt = require('bcrypt');
// jsonwebtoken: gera o token JWT que o usuário usa para provar que está logado
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// LOGIN: recebe email e senha e devolve um token se estiver tudo certo
exports.login = async (req, res) => {
  try {
    // Pego email e senha que vieram no corpo da requisição
    const { email, senha } = req.body;

    // Procuro no banco o usuário com esse email (só busca se os dois campos vieram)
    const usuario = email && senha && (await Usuario.findOne({ where: { email } }));

    // Se o usuário não existe OU a senha não bate com o hash salvo, devolvo 401 (não autorizado).
    // Uso a mesma mensagem nos dois casos para não revelar se o email existe.
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gero o token guardando o id do usuário dentro dele.
    // Ele expira no tempo definido no .env (ou em 1 hora se não tiver nada).
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    res.json({ token });
  } catch (e) {
    // Qualquer erro inesperado vira 500 (erro interno do servidor)
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// REGISTRAR: cria um usuário novo
exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Antes de criar, vejo se já existe alguém com esse email. Se existir, devolvo 409 (conflito).
    if (await Usuario.findOne({ where: { email } })) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Nunca salvo a senha pura no banco: transformo em hash (o 10 é a força da criptografia)
    const hash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senha: hash });

    // Devolvo 201 (criado) mostrando só id, nome e email — a senha nunca volta na resposta
    res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
