const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Model da Reserva: representa a tabela de reservas no banco
module.exports = sequelize.define('Reserva', {
  // quem fez a reserva (a ligação com a tabela de usuários é feita no models/index.js)
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  // qual sala foi reservada
  salaId: { type: DataTypes.INTEGER, allowNull: false },
  // quando a reserva começa e quando termina
  horarioInicio: { type: DataTypes.DATE, allowNull: false },
  horarioFim: { type: DataTypes.DATE, allowNull: false },
  // status só pode ser 'ativa' ou 'cancelada'; quando cria, começa como 'ativa'
  status: { type: DataTypes.ENUM('ativa', 'cancelada'), allowNull: false, defaultValue: 'ativa' },
});
