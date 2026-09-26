// Carrega as variáveis do arquivo .env (porta, senha do banco, segredo do JWT...)
require('dotenv').config();
// Importo o app do Express que configurei no arquivo src/app.js
const app = require('./src/app');
// Importo a conexão com o banco de dados MySQL
const sequelize = require('./src/config/database');

// Usa a porta do .env; se não tiver nada lá, usa a 3000
const port = process.env.PORT || 3000;

// Liga o servidor e mostra no console em qual porta ele está rodando
app.listen(port, () => console.log(`Servidor na porta ${port}`));

// Testa se consegue conectar no MySQL e avisa no console se deu certo ou errado
sequelize.authenticate().then(() => console.log('MySQL conectado')).catch(e => console.error('MySQL indisponível:', e.message));
