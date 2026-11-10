
const { buscarUbigeo } = require('../adapters/ineiAdapter');

// Validar el formato del UBIGEO
function validarUbigeo(ubigeo) {
    const formato = /^[0-9]{6}$/;

    return typeof ubigeo === 'string'
        && formato.test(ubigeo);
}

// Consultar información territorial del INEI
function consultarUbigeo(ubigeo) {

    if (!validarUbigeo(ubigeo)) {
        throw new Error('El UBIGEO debe contener exactamente 6 números');
    }

    // Obtener información desde el adaptador
    const territorio = buscarUbigeo(ubigeo);

    return territorio;
}

module.exports = {
    validarUbigeo,
    consultarUbigeo
};
