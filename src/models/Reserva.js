const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Reserva', {
  // ponytail: usuarioId sem FK declarada; a associação com Usuario entra na issue do model Usuario
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  salaId: { type: DataTypes.INTEGER, allowNull: false },
  horarioInicio: { type: DataTypes.DATE, allowNull: false },
  horarioFim: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('ativa', 'cancelada'), allowNull: false, defaultValue: 'ativa' },
});
