// Carrega o .env para eu poder ler os dados do banco
require('dotenv').config();
// Sequelize é o ORM: com ele eu mexo no banco usando objetos JavaScript em vez de escrever SQL
const { Sequelize } = require('sequelize');

// Crio a conexão com o MySQL usando os dados que estão no .env
// (nome do banco, usuário, senha, host e porta). logging: false esconde os SQLs no console.
module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false }
);
