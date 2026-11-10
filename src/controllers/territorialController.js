
const {
    validarUbigeo,
    consultarUbigeo
} = require('../services/territorialService');

// Consultar información territorial
function consultarTerritorio(req, res) {
    const { ubigeo } = req.params;

    // Validar el formato
    if (!validarUbigeo(ubigeo)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El UBIGEO debe contener exactamente 6 números'
        });
    }

    try {
        // Consultar el Servicio Territorial
        const territorio = consultarUbigeo(ubigeo);

        // Comprobar si existe
        if (!territorio) {
            return res.status(404).json({
                estado: 'No encontrado',
                mensaje: 'El UBIGEO no existe en los datos disponibles del INEI'
            });
        }

        // Devolver la información encontrada
        return res.status(200).json({
            estado: 'Correcto',
            fuente: 'INEI - Archivo UBIGEO 2022',
            datos: territorio
        });

    } catch (error) {
        console.error('Error territorial:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo consultar la información territorial'
        });
    }
}

module.exports = { consultarTerritorio };
