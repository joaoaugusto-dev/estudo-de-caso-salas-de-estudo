// Importo o Express, que é o framework que uso para criar a API
const express = require('express');
// Importo o arquivo que junta todas as rotas do projeto
const routes = require('./routes');

// Crio a aplicação
const app = express();

// Faz o Express entender o corpo das requisições quando vem em formato JSON
app.use(express.json());

// Todas as rotas começam com /api (ex: /api/salas, /api/auth/login)
app.use('/api', routes);

// Exporto o app para o server.js ligar o servidor e para os testes usarem
module.exports = app;
