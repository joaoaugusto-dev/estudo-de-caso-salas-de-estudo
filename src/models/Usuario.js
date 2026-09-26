const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Model do Usuário: representa a tabela "usuarios" no banco
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // chave primária que aumenta sozinha
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }, // unique: não deixa repetir email
  senha: { type: DataTypes.STRING, allowNull: false }, // aqui fica o hash da senha, não a senha pura
}, { tableName: 'usuarios' }); // defino o nome da tabela manualmente

module.exports = Usuario;
