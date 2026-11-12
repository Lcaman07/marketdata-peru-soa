
const express = require('express');

const {
    consultarRuc
} = require('../controllers/empresarialController');

const {
    consultarEmpresaOnline
} = require('../controllers/openRucController');

const {
    obtenerHistorial,
    obtenerBitacora
} = require('../controllers/historialController');

const router = express.Router();

// Historial de consultas empresariales
router.get('/historial', obtenerHistorial);

// Bitácora de integración SOA
router.get('/bitacora', obtenerBitacora);


 // Consulta empresarial en línea mediante OpenRUC
 // Proveedor externo, no API oficial de SUNAT
 router.get('/online/:ruc', consultarEmpresaOnline);


// Consulta empresarial por RUC
router.get('/ruc/:ruc', consultarRuc);

module.exports = router;
