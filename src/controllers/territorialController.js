
const { validarUbigeo } = require('../services/territorialService');

function consultarTerritorio(req, res) {
    const { ubigeo } = req.params;

    if (!validarUbigeo(ubigeo)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El UBIGEO debe contener exactamente 6 números'
        });
    }

    return res.status(200).json({
        estado: 'Validación correcta',
        ubigeo: ubigeo,
        fuente: 'INEI',
        mensaje: 'UBIGEO con formato válido. Consulta INEI pendiente de integración.'
    });
}

module.exports = { consultarTerritorio };
