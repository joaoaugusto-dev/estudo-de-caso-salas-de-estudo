const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.get('/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
