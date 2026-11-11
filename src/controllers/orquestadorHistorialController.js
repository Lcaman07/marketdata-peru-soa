
const {
    listarAnalisisIntegrados
} = require('../models/orquestadorModel');

async function obtenerHistorialIntegrado(req, res) {
    try {
        const historial = await listarAnalisisIntegrados();

        return res.status(200).json({
            estado: 'Consulta correcta',
            servicio: 'Historial del Orquestador SOA',
            total: historial.length,
            datos: historial
        });

    } catch (error) {
        console.error(
            'Error al consultar historial integrado:',
            error.message
        );

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo recuperar el historial integrado'
        });
    }
}

module.exports = {
    obtenerHistorialIntegrado
};
