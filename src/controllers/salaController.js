const { Sala } = require('../models');

exports.listar = async (req, res) => {
  try {
    res.json(await Sala.findAll({ order: [['id', 'ASC']] }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
