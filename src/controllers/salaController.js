const { sequelize, Sala, Reserva } = require('../models');

exports.listar = async (req, res) => {
  try {
    res.json(await Sala.findAll({ order: [['id', 'ASC']] }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, capacidade } = req.body;
    res.status(201).json(await Sala.create({ nome, capacidade }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// exclusão real, mas recusada com reserva ativa (não derruba a reserva de outro usuário); o histórico de canceladas some junto
exports.deletar = async (req, res) => {
  try {
    const salaId = req.params.id;
    const resultado = await sequelize.transaction(async (transaction) => {
      if (!(await Sala.findByPk(salaId, { transaction }))) return 404;
      if (await Reserva.findOne({ where: { salaId, status: 'ativa' }, transaction })) return 409;
      await Reserva.destroy({ where: { salaId }, transaction });
      await Sala.destroy({ where: { id: salaId }, transaction });
      return 204;
    });
    if (resultado === 404) return res.status(404).json({ erro: 'Sala não encontrada' });
    if (resultado === 409) return res.status(409).json({ erro: 'Sala tem reservas ativas' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
