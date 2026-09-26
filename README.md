# Salas de Estudo

API REST para reserva de salas de estudo, feita em Node.js, Express, Sequelize e MySQL. Estudo de caso da disciplina de desenvolvimento Web (Node.js / Express).

## O problema

Em uma biblioteca ou faculdade, as salas de estudo são poucas e a disputa por elas é grande. Sem controle, dois grupos chegam à mesma sala no mesmo horário. A API resolve isso: o aluno se cadastra, consulta as salas e reserva um horário, e o sistema **recusa reservas que se sobreponham** a uma já existente na mesma sala.

## Requisitos da disciplina

| Requisito | Onde está |
|---|---|
| Model com Sequelize e MySQL | `src/models/` (`Usuario`, `Sala`, `Reserva`, com associações) |
| Middleware JWT (`verifyToken`) em rota protegida | `src/middlewares/verifyToken.js`, usado em `/api/reservas`, `/api/usuarios/me` e na escrita em `/api/salas` |
| express-validator | `src/validators/` (cadastro, login, reserva e sala) + `src/middlewares/handleValidation.js` |
| bcrypt | `src/controllers/authController.js` (hash no cadastro, `compare` no login) |

## Arquitetura (MVC)

```
server.js                 sobe o servidor e testa a conexão com o MySQL
src/
  app.js                  Express + JSON + rotas em /api
  config/database.js      instância do Sequelize (lê o .env)
  routes/                 mapeia URL -> middlewares -> controller
  middlewares/            verifyToken (JWT) e handleValidation (erros do validator)
  validators/             regras do express-validator
  controllers/            regras de negócio e respostas HTTP
  models/                 Usuario, Sala, Reserva e associações
  seeds/salas.js          popula as salas iniciais
test/                     testes automatizados (node:test)
docs/                     collection do Insomnia
```

Fluxo de uma requisição: `rota -> verifyToken -> validator -> handleValidation -> controller -> model`.

### Modelo de dados

- **Usuario**: `id`, `nome`, `email` (único), `senha` (hash bcrypt)
- **Sala**: `id`, `nome`, `capacidade`
- **Reserva**: `id`, `usuarioId`, `salaId`, `horarioInicio`, `horarioFim`, `status` (`ativa` | `cancelada`)

Um usuário e uma sala têm muitas reservas.

## Como rodar

Pré-requisitos: Node.js e um MySQL com um banco criado.

```bash
npm install
cp .env.example .env     # preencha com os dados do seu MySQL
npm run seed             # cria as tabelas e 4 salas (pode rodar mais de uma vez)
npm run dev              # http://localhost:3000
```

Variáveis do `.env`: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `JWT_EXPIRES_IN`.

Testes automatizados: `npm test`.

## Rotas

Base: `/api`. Rotas marcadas com 🔒 exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| GET | `/ping` | Verifica se a API está no ar | 200 |
| POST | `/auth/register` | Cadastra usuário | 201, 400, 409 (e-mail já usado) |
| POST | `/auth/login` | Retorna o token JWT | 200, 400, 401 |
| GET | `/salas` | Lista as salas (pública) | 200 |
| POST | `/salas` 🔒 | Cria sala (`nome`, `capacidade`) | 201, 400, 401 |
| DELETE | `/salas/:id` 🔒 | Exclui a sala | 204, 401, 404, 409 (reserva ativa) |
| POST | `/reservas` 🔒 | Cria reserva | 201, 400, 401, 404 (sala), 409 (conflito) |
| GET | `/reservas` 🔒 | Lista as reservas do usuário | 200, 401 |
| DELETE | `/reservas/:id` 🔒 | Cancela a própria reserva | 204, 401, 404 |
| DELETE | `/usuarios/me` 🔒 | Exclui a própria conta | 204, 401, 404 |

Exemplo de reserva:

```json
POST /api/reservas
{ "salaId": 1, "horarioInicio": "2026-10-01T10:00:00Z", "horarioFim": "2026-10-01T11:00:00Z" }
```

### Decisões de projeto

- **Conflito de horário:** duas reservas se sobrepõem quando uma começa antes do fim da outra e termina depois do início dela. Horários que apenas se encostam (10h–11h e 11h–12h) não conflitam. O conflito só considera reservas `ativa`.
- **Cancelar reserva** é *soft delete*: a linha continua no banco com `status = 'cancelada'`, preservando o histórico, e o horário fica livre.
- **Excluir conta** é *delete real*: apaga o usuário e as reservas dele numa transação, sem auditoria. Serve de contraste com o cancelamento.
- **Excluir sala** é *delete real*, mas só se ela não tiver reservas `ativa` (senão 409, para não derrubar a reserva de outro usuário). As reservas `cancelada` da sala são apagadas junto, numa transação.
- **Reserva de outro usuário** responde 404, sem revelar que ela existe.
- **Limitação conhecida:** a checagem de conflito e a inserção não são atômicas; duas requisições simultâneas podem passar. Para concorrência real, seria preciso travar a sala em uma transação.

## Collection do Insomnia

O arquivo [docs/insomnia-collection.json](docs/insomnia-collection.json) tem os casos de teste em ordem: cadastro e login, sucesso, 401 sem token, 400 de validação, 409 de conflito, listagem, cancelamento, criação e exclusão de salas e exclusão de conta. Os requests encadeiam token e ids pelas respostas anteriores.

1. Insomnia: **Import** -> **From File** -> selecione o JSON.
2. Suba a API (`npm run dev`) e rode `npm run seed`.
3. Rode a collection **inteira, em ordem**. Ela apaga o que cria (inclusive a sala de teste), então pode ser repetida.

O nome de cada request começa com o status HTTP esperado. A URL base fica no ambiente (`base_url`).

## Equipe

João Augusto de Freitas e Henrique Molinari.
