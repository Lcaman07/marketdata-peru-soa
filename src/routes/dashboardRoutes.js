
const express = require('express');

const {
    consultarIndicadores,
    consultarIndicadoresTerritoriales,
    consultarIndicadorPoblacion
} = require('../controllers/dashboardController');

const {
    consultarComparacion
} = require('../controllers/comparacionController');

const router = express.Router();

// Indicadores empresariales SUNAT
router.get('/indicadores', consultarIndicadores);

// Indicadores territoriales INEI
router.get('/territorio', consultarIndicadoresTerritoriales);

// Indicadores de población por distrito
router.get('/poblacion/:ubigeo', consultarIndicadorPoblacion);

// Comparación poblacional entre dos distritos
router.get(
    '/comparar/:ubigeoA/:ubigeoB',
    consultarComparacion
);
module.exports = router;
