const router = require('express').Router();
const { listar } = require('../controllers/salaController');

router.get('/', listar);

module.exports = router;
