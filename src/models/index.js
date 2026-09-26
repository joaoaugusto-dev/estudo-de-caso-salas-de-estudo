const sequelize = require('../config/database');
const Sala = require('./Sala');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');

Sala.hasMany(Reserva, { foreignKey: 'salaId' });
Reserva.belongsTo(Sala, { foreignKey: 'salaId' });
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = { sequelize, Sala, Usuario, Reserva };