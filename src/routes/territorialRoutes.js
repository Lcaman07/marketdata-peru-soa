
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

const {
    consultarMapaDistritalInei,
    consultarMapaPorUbigeo
} = require('../controllers/ineiWmsController');

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

// Consultar distrito mediante el WFS oficial del INEI
router.get('/wfs/:ubigeo', consultarDistritoIneiWfs);

// Obtener mapa distrital mediante el WMS oficial del INEI
router.get('/wms/mapa-distrital', consultarMapaDistritalInei);

// Generar mapa oficial del INEI según el UBIGEO
router.get('/wms/mapa-distrital/:ubigeo', consultarMapaPorUbigeo);

// Consultar información territorial y poblacional por UBIGEO
router.get('/:ubigeo', consultarTerritorio);

module.exports = router;
