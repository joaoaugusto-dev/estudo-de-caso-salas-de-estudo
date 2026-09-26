const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Sala', {
  nome: { type: DataTypes.STRING, allowNull: false },
  capacidade: { type: DataTypes.INTEGER, allowNull: false },
});
