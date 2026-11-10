
const express = require('express');

const {
    consultarTerritorio,
    consultarDepartamentos,
    consultarProvincias,
    consultarDistritos
} = require('../controllers/territorialController');

const router = express.Router();

// Listar departamentos
router.get('/departamentos', consultarDepartamentos);

// Listar provincias de un departamento
router.get(
    '/departamentos/:codigoDepartamento/provincias',
    consultarProvincias
);

// Listar distritos de una provincia
router.get(
    '/provincias/:codigoProvincia/distritos',
    consultarDistritos
);

// Consultar información territorial y poblacional por UBIGEO
router.get('/:ubigeo', consultarTerritorio);

module.exports = router;
