const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Model da Sala: representa a tabela de salas de estudo no banco
// (o Sequelize cria o id sozinho). Nome e capacidade são obrigatórios (allowNull: false).
module.exports = sequelize.define('Sala', {
  nome: { type: DataTypes.STRING, allowNull: false },
  capacidade: { type: DataTypes.INTEGER, allowNull: false }, // quantas pessoas cabem
});
