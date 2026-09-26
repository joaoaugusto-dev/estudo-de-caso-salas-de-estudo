const { sequelize, Usuario, Reserva } = require('../models');

// exclusão real (DELETE no banco), sem soft delete nem auditoria: a conta e as reservas dela somem
exports.deletarMinhaConta = async (req, res) => {
  try {
    const apagados = await sequelize.transaction(async (transaction) => {
      await Reserva.destroy({ where: { usuarioId: req.usuarioId }, transaction });
      return Usuario.destroy({ where: { id: req.usuarioId }, transaction });
    });
    if (!apagados) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Conta excluída' });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
