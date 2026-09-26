const { sequelize, Usuario, Reserva } = require('../models');

// LISTAR USUÁRIOS: devolve todos, só com id, nome e email (o hash da senha nunca sai)
exports.listar = async (req, res) => {
  try {
    res.json(await Usuario.findAll({ attributes: ['id', 'nome', 'email'], order: [['id', 'ASC']] }));
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// DELETAR MINHA CONTA: o usuário logado apaga a própria conta.
// É exclusão de verdade (DELETE no banco), sem "soft delete": a conta e as reservas dela somem.
exports.deletarMinhaConta = async (req, res) => {
  try {
    // Transação: apago as reservas e o usuário juntos; se um falhar, o outro é desfeito
    const apagados = await sequelize.transaction(async (transaction) => {
      // Primeiro as reservas do usuário (o id vem do token, req.usuarioId)
      await Reserva.destroy({ where: { usuarioId: req.usuarioId }, transaction });
      // Depois o usuário. O destroy devolve quantos registros apagou.
      return Usuario.destroy({ where: { id: req.usuarioId }, transaction });
    });
    // Se não apagou nenhum, o usuário não existia -> 404
    if (!apagados) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Conta excluída' });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
