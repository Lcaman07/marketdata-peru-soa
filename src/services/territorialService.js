
/**
 * Servicio Territorial - MarketData Perú
 * Validación de códigos UBIGEO.
 */

function validarUbigeo(ubigeo) {
    // El UBIGEO debe contener exactamente 6 números
    const formato = /^[0-9]{6}$/;

    return formato.test(ubigeo);
}

module.exports = {
    validarUbigeo
};
