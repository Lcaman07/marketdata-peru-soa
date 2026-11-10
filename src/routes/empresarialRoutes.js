
const express = require('express');

const {
    consultarRuc
} = require('../controllers/empresarialController');

// Crear el enrutador de Express
const router = express.Router();

// Ruta para consultar información empresarial por RUC
router.get('/ruc/:ruc', consultarRuc);

// Exportar el enrutador
module.exports = router;
