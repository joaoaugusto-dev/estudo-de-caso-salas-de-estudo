const sequelize = require('../config/database');
const { Sala } = require('../models');

// Salas iniciais que quero deixar cadastradas no banco
const salas = [
  { nome: 'Sala Alan Turing', capacidade: 4 },
  { nome: 'Sala Ada Lovelace', capacidade: 6 },
  { nome: 'Sala Grace Hopper', capacidade: 8 },
  { nome: 'Sala Linus Torvalds', capacidade: 12 },
];

// Script para popular o banco. Só cadastra se a tabela estiver vazia,
// então posso rodar mais de uma vez sem duplicar as salas.
(async () => {
  try {
    // sync cria as tabelas no banco caso ainda não existam
    await sequelize.sync();
    if ((await Sala.count()) === 0) {
      // bulkCreate insere todas as salas de uma vez
      await Sala.bulkCreate(salas);
      console.log(`${salas.length} salas criadas`);
    } else {
      console.log('Tabela de salas já populada, nada a fazer');
    }
  } catch (e) {
    console.error('Falha no seed:', e.message);
    process.exitCode = 1; // marca que o script terminou com erro
  } finally {
    // Sempre fecho a conexão no final, senão o script ficaria travado aberto
    await sequelize.close();
  }
})();
