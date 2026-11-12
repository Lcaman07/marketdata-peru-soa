
const express = require('express');

const {
    consultarTerritorio,
    consultarDepartamentos,
    consultarProvincias,
    consultarDistritos
} = require('../controllers/territorialController');

const {
    consultarDistritoIneiWfs
} = require('../controllers/ineiWfsController');

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

// Consultar un distrito en línea mediante el WFS oficial del INEI
router.get('/wfs/:ubigeo', consultarDistritoIneiWfs);

module.exports = router;
