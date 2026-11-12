
/**
 * MarketData Perú
 * Controlador de integración con el servicio WFS del INEI
 */

const {
    consultarDistritoWfs
} = require('../adapters/ineiWfsAdapter');

async function consultarDistritoIneiWfs(req, res) {

    const { ubigeo } = req.params;

    // Validar el código recibido
    if (!/^\d{6}$/.test(ubigeo)) {
        return res.status(400).json({
            estado: 'ERROR',
            mensaje: 'El UBIGEO debe contener 6 dígitos.'
        });
    }

    try {
        // Consumir información oficial del INEI en línea
        const distrito = await consultarDistritoWfs(ubigeo);

        if (!distrito) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Distrito no encontrado en el INEI.'
            });
        }

        return res.status(200).json({
            estado: 'COMPLETA',
            mensaje: 'Consulta oficial del INEI realizada correctamente.',
            fuente: 'INEI - Servicio WFS',
            datos: distrito
        });

    } catch (error) {

        console.error(
            'Error al consultar el servicio WFS del INEI:',
            error
        );

        const esTimeout =
            error.name === 'TimeoutError' ||
            error.name === 'AbortError';

        return res.status(esTimeout ? 504 : 502).json({
            estado: 'ERROR',
            mensaje: esTimeout
                ? 'El servicio del INEI superó el tiempo de espera.'
                : 'No fue posible consultar el servicio del INEI.'
        });
    }
}

module.exports = {
    consultarDistritoIneiWfs
};
