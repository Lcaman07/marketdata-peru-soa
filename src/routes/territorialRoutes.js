
const express = require('express');

const {
    consultarTerritorio
} = require('../controllers/territorialController');

const router = express.Router();

// Servicio REST para consultar una zona por UBIGEO
router.get('/:ubigeo', consultarTerritorio);

// Exportar correctamente las rutas
module.exports = router;
