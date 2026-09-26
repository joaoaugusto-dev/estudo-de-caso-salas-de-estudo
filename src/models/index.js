const sequelize = require('../config/database');
const Sala = require('./Sala');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');

// Aqui eu defino os relacionamentos entre as tabelas:
// uma Sala tem várias Reservas, e cada Reserva pertence a uma Sala
Sala.hasMany(Reserva, { foreignKey: 'salaId' });
Reserva.belongsTo(Sala, { foreignKey: 'salaId' });
// um Usuário tem várias Reservas, e cada Reserva pertence a um Usuário
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Exporto tudo junto para os outros arquivos importarem de um lugar só
module.exports = { sequelize, Sala, Usuario, Reserva };
