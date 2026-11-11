
const {
    listarHistorialEmpresarial,
    listarBitacoraEmpresarial
} = require('../models/consultaModel');

// Consultar el historial empresarial
async function obtenerHistorial(req, res) {
    try {
        const historial = await listarHistorialEmpresarial();

        return res.status(200).json({
            estado: 'Consulta correcta',
            servicio: 'Historial Empresarial',
            total: historial.length,
            datos: historial
        });

    } catch (error) {
        console.error('Error al consultar historial:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo recuperar el historial empresarial'
        });
    }
}

// Consultar la bitácora de integración SOA
async function obtenerBitacora(req, res) {
    try {
        const bitacora = await listarBitacoraEmpresarial();

        return res.status(200).json({
            estado: 'Consulta correcta',
            servicio: 'Bitácora de Integración SOA',
            total: bitacora.length,
            datos: bitacora
        });

    } catch (error) {
        console.error('Error al consultar bitácora:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo recuperar la bitácora de integración'
        });
    }
}

module.exports = {
    obtenerHistorial,
    obtenerBitacora
};
