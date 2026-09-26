const { Op } = require('sequelize');
const { Sala, Reserva } = require('../models');

exports.criar = async (req, res) => {
  try {
    const { salaId, horarioInicio, horarioFim } = req.body;

    if (!(await Sala.findByPk(salaId))) {
      return res.status(404).json({ erro: 'Sala não encontrada' });
    }

    // sobreposição: começa antes do fim pedido e termina depois do início pedido
    const conflito = await Reserva.findOne({
      where: {
        salaId,
        status: 'ativa',
        horarioInicio: { [Op.lt]: horarioFim },
        horarioFim: { [Op.gt]: horarioInicio },
      },
    });
    // ponytail: checar e inserir não é atômico; duas requisições simultâneas podem passar. Travar a sala numa transação se houver concorrência real.
    if (conflito) {
      return res.status(409).json({ erro: 'Sala já reservada nesse horário' });
    }

    const reserva = await Reserva.create({ usuarioId: req.usuarioId, salaId, horarioInicio, horarioFim });
    res.status(201).json(reserva);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
