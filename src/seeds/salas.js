const sequelize = require('../config/database');
const { Sala } = require('../models');

const salas = [
  { nome: 'Sala Alan Turing', capacidade: 4 },
  { nome: 'Sala Ada Lovelace', capacidade: 6 },
  { nome: 'Sala Grace Hopper', capacidade: 8 },
  { nome: 'Sala Linus Torvalds', capacidade: 12 },
];

// só popula se a tabela estiver vazia, então pode rodar mais de uma vez
(async () => {
  try {
    await sequelize.sync();
    if ((await Sala.count()) === 0) {
      await Sala.bulkCreate(salas);
      console.log(`${salas.length} salas criadas`);
    } else {
      console.log('Tabela de salas já populada, nada a fazer');
    }
  } catch (e) {
    console.error('Falha no seed:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
