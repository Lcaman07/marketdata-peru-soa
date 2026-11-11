
const express = require('express');

const {
    consultarAnalisis
} = require('../controllers/orquestadorController');

const {
    obtenerHistorialIntegrado
} = require('../controllers/orquestadorHistorialController');

const router = express.Router();

// Consultar historial de análisis integrados
router.get('/historial', obtenerHistorialIntegrado);

// Realizar análisis territorial y empresarial
router.get(
    '/analisis/:ubigeo/:ruc',
    consultarAnalisis
);

module.exports = router;
