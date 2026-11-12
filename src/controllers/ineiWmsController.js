
/**
 * MarketData Perú
 * Controlador del servicio WMS oficial del INEI
 * Devuelve un mapa distrital en formato PNG.
 */

const {
    obtenerMapaDistrital
} = require('../adapters/ineiWmsAdapter');

const {
    obtenerLimitesDistrito
} = require('../adapters/ineiGeometriaAdapter');


/**
 * Obtener el mapa distrital predeterminado del INEI WMS.
 */
async function consultarMapaDistritalInei(req, res) {

    try {
        const imagen = await obtenerMapaDistrital();

        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'no-store');

        return res.status(200).send(imagen);

    } catch (error) {

        console.error(
            'Error al consultar el mapa WMS del INEI:',
            error.message
        );

        const esTimeout =
            error.name === 'TimeoutError' ||
            error.name === 'AbortError';

        return res.status(esTimeout ? 504 : 502).json({
            estado: 'ERROR',
            mensaje: esTimeout
                ? 'El servicio WMS del INEI superó el tiempo de espera.'
                : 'No fue posible obtener el mapa oficial del INEI.'
        });
    }
}

async function consultarMapaPorUbigeo(req, res) {
    try {
        // Obtener la imagen desde el servicio oficial
        const imagen = await obtenerMapaDistrital();

        // Enviar la imagen al navegador
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'no-store');

        return res.status(200).send(imagen);

    } catch (error) {

        console.error(
            'Error al consultar el mapa WMS del INEI:',
            error.message
        );

        const esTimeout =
            error.name === 'TimeoutError' ||
            error.name === 'AbortError';

        return res.status(esTimeout ? 504 : 502).json({
            estado: 'ERROR',
            mensaje: esTimeout
                ? 'El servicio WMS del INEI superó el tiempo de espera.'
                : 'No fue posible obtener el mapa oficial del INEI.'
        });
    }
}


/**
 * Generar un mapa utilizando el UBIGEO seleccionado.
 * WFS obtiene los límites y WMS genera la imagen.
 */
async function consultarMapaPorUbigeo(req, res) {

    const { ubigeo } = req.params;

    if (!/^\d{6}$/.test(ubigeo)) {
        return res.status(400).json({
            estado: 'ERROR',
            mensaje: 'El UBIGEO debe contener 6 dígitos.'
        });
    }

    try {
        // Consultar los límites geográficos en el INEI WFS
        const limites = await obtenerLimitesDistrito(ubigeo);

        if (!limites) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Distrito no encontrado en el INEI.'
            });
        }

        // Generar el mapa con las coordenadas obtenidas
        const imagen = await obtenerMapaDistrital(limites.bbox);

        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'no-store');

        return res.status(200).send(imagen);

    } catch (error) {

        console.error(
            'Error al generar mapa territorial:',
            error.message
        );

        const esTimeout =
            error.name === 'TimeoutError' ||
            error.name === 'AbortError';

        return res.status(esTimeout ? 504 : 502).json({
            estado: 'ERROR',
            mensaje: esTimeout
                ? 'El servicio del INEI superó el tiempo de espera.'
                : 'No fue posible generar el mapa territorial.'
        });
    }
}


module.exports = {
    consultarMapaDistritalInei,
    consultarMapaPorUbigeo
};
