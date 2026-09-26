const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');

Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = { sequelize, Usuario, Reserva };
