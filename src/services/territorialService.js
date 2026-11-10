
const { buscarUbigeo } = require('../adapters/ineiAdapter');

const { buscarPoblacion } = require('../adapters/poblacionAdapter');

// Validar el formato del UBIGEO
function validarUbigeo(ubigeo) {
    return typeof ubigeo === 'string'
        && /^[0-9]{6}$/.test(ubigeo);
}

// Consultar información territorial y poblacional
function consultarUbigeo(ubigeo) {

    if (!validarUbigeo(ubigeo)) {
        throw new Error('El UBIGEO debe contener exactamente 6 números');
    }

    // Obtener información territorial
    const territorio = buscarUbigeo(ubigeo);

    if (!territorio) {
        return null;
    }

    // Obtener información poblacional
    const poblacion = buscarPoblacion(ubigeo);

    // Consolidar ambas fuentes de información
    return {
        ...territorio,

        poblacion: poblacion ? {
            proyectada2026: poblacion.poblacion2026,
            serieAnual: poblacion.poblacionPorAnio,
            tipoDato: poblacion.tipoDato,
            fuente: poblacion.fuente
        } : null
    };
}

module.exports = {
    validarUbigeo,
    consultarUbigeo
};
