
/**
 * MarketData Perú
 * Controlador de consulta RUC en línea.
 * Proveedor externo: OpenRUC.
 * No corresponde a una API oficial de SUNAT.
 */

const {
    consultarRucOnline
} = require('../adapters/openRucAdapter');

const {
    validarRuc
} = require('../services/empresarialService');

async function consultarEmpresaOnline(req, res) {

    const { ruc } = req.params;

    // Validar el número de RUC
    if (!validarRuc(ruc)) {
        return res.status(400).json({
            estado: 'ERROR',
            mensaje: 'El número de RUC no es válido.'
        });
    }

    // OpenRUC está orientado a personas jurídicas
    if (!ruc.startsWith('20')) {
        return res.status(422).json({
            estado: 'ERROR',
            mensaje: 'Esta consulta externa solo admite RUC que comienzan con 20.'
        });
    }

    try {
        const empresa = await consultarRucOnline(ruc);

        if (!empresa) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'El RUC no está disponible en OpenRUC.'
            });
        }

        return res.status(200).json({
            estado: 'COMPLETA',
            servicio: 'Consulta empresarial en línea',
            proveedor: 'OpenRUC',
            esApiOficialSunat: false,
            datos: empresa
        });

    } catch (error) {

        console.error(
            'Error en la consulta empresarial externa:',
            error.message
        );

        const esTimeout =
            error.name === 'TimeoutError' ||
            error.name === 'AbortError';

        return res.status(esTimeout ? 504 : 502).json({
            estado: 'ERROR',
            mensaje: esTimeout
                ? 'La consulta empresarial superó el tiempo de espera.'
                : 'El proveedor empresarial externo no está disponible.'
        });
    }
}

module.exports = {
    consultarEmpresaOnline
};
