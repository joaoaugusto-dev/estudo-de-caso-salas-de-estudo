const sequelize = require('../config/database');
const Sala = require('./Sala');
const Reserva = require('./Reserva');

Sala.hasMany(Reserva, { foreignKey: 'salaId' });
Reserva.belongsTo(Sala, { foreignKey: 'salaId' });

module.exports = { sequelize, Sala, Reserva };
