const { sequelize, Sala, Reserva } = require('../models');

// LISTAR SALAS: devolve todas as salas ordenadas pelo id. Qualquer pessoa pode ver (não precisa de login).
exports.listar = async (req, res) => {
  try {
    res.json(await Sala.findAll({ order: [['id', 'ASC']] }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// CRIAR SALA: cria uma sala nova com nome e capacidade (os dados já foram validados na rota)
exports.criar = async (req, res) => {
  try {
    const { nome, capacidade } = req.body;
    // 201 = criado com sucesso, e devolvo a sala que foi criada
    res.status(201).json(await Sala.create({ nome, capacidade }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// DELETAR SALA: apaga de verdade do banco, mas se tiver reserva ativa eu recuso,
// para não derrubar a reserva de outro usuário. As reservas canceladas (histórico) somem junto com a sala.
exports.deletar = async (req, res) => {
  try {
    const salaId = req.params.id;

    // Uso uma transação: ou tudo dá certo, ou nada é alterado (evita apagar as reservas e falhar ao apagar a sala)
    const resultado = await sequelize.transaction(async (transaction) => {
      // Sala não existe -> 404
      if (!(await Sala.findByPk(salaId, { transaction }))) return 404;
      // Tem reserva ativa -> 409 (conflito), não deixo apagar
      if (await Reserva.findOne({ where: { salaId, status: 'ativa' }, transaction })) return 409;
      // Apago primeiro as reservas (canceladas) da sala e depois a própria sala
      await Reserva.destroy({ where: { salaId }, transaction });
      await Sala.destroy({ where: { id: salaId }, transaction });
      return 204;
    });

    // Fora da transação, traduzo o resultado para a resposta HTTP
    if (resultado === 404) return res.status(404).json({ erro: 'Sala não encontrada' });
    if (resultado === 409) return res.status(409).json({ erro: 'Sala tem reservas ativas' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
