// Op traz os operadores do Sequelize (menor que, maior que...) para usar nas consultas
const { Op } = require('sequelize');
const { Sala, Reserva } = require('../models');

// CRIAR RESERVA: o usuário logado reserva uma sala num horário
exports.criar = async (req, res) => {
  try {
    const { salaId, horarioInicio, horarioFim } = req.body;

    // Primeiro confiro se a sala existe. Se não existir, devolvo 404 (não encontrado).
    if (!(await Sala.findByPk(salaId))) {
      return res.status(404).json({ erro: 'Sala não encontrada' });
    }

    // Agora vejo se já existe reserva ativa na mesma sala que bate com esse horário.
    // Dois horários se sobrepõem quando a reserva existente começa ANTES do fim pedido
    // e termina DEPOIS do início pedido.
    const conflito = await Reserva.findOne({
      where: {
        salaId,
        status: 'ativa', // reservas canceladas não contam
        horarioInicio: { [Op.lt]: horarioFim }, // lt = menor que
        horarioFim: { [Op.gt]: horarioInicio }, // gt = maior que
      },
    });

    // Limitação: checar e salvar não é uma operação única. Se duas pessoas reservarem
    // exatamente ao mesmo tempo, as duas podem passar. Para resolver precisaria de transação.
    if (conflito) {
      return res.status(409).json({ erro: 'Sala já reservada nesse horário' });
    }

    // Sem conflito: crio a reserva. O usuarioId vem do token (req.usuarioId), não do corpo da requisição.
    const reserva = await Reserva.create({ usuarioId: req.usuarioId, salaId, horarioInicio, horarioFim });
    res.status(201).json(reserva);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};


// LISTAR MINHAS RESERVAS: mostra só as reservas do usuário logado
exports.listarMinhas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { usuarioId: req.usuarioId }, // só as minhas
      // junto os dados da sala em cada reserva (só id, nome e capacidade)
      include: [{ model: Sala, attributes: ['id', 'nome', 'capacidade'] }],
      order: [['horarioInicio', 'ASC']], // ordeno da mais cedo para a mais tarde
    });
    res.json(reservas);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// CANCELAR RESERVA: só o dono pode cancelar. Não apago do banco, só mudo o status para "cancelada".
// Se a reserva for de outra pessoa, respondo 404 (e não 403) para não revelar que ela existe.
exports.cancelar = async (req, res) => {
  try {
    // Busco pelo id da URL E pelo dono, assim reserva de outro usuário nem é encontrada
    const reserva = await Reserva.findOne({ where: { id: req.params.id, usuarioId: req.usuarioId } });
    if (!reserva) {
      return res.status(404).json({ erro: 'Reserva não encontrada' });
    }
    await reserva.update({ status: 'cancelada' });
    // deu certo: devolvo uma mensagem confirmando o cancelamento
    res.json({ mensagem: 'Reserva cancelada' });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
};
