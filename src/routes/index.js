const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/reservas', require('./reservaRoutes'));
router.use('/salas', require('./salaRoutes'));
router.get('/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
