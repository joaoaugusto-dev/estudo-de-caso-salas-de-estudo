require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Servidor na porta ${port}`));
// ponytail: só testa a conexão; sync() entra quando os models existirem
sequelize.authenticate().then(() => console.log('MySQL conectado')).catch(e => console.error('MySQL indisponível:', e.message));
