
const express = require('express');

const { obtenerSalud } = require('../controllers/saludController');

const router = express.Router();

// Ruta para consultar el estado del sistema
router.get('/', obtenerSalud);

module.exports = router;
