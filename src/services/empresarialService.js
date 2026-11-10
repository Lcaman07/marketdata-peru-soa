
/**
 * Servicio Empresarial - MarketData Perú
 * Validación de RUC y consulta al padrón SUNAT almacenado en MySQL.
 */

const { buscarPorRuc } = require('../models/contribuyenteModel');

function validarRuc(ruc) {

    if (typeof ruc !== 'string' ||
        !/^[0-9]{11}$/.test(ruc)) {
        return false;
    }

    const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let suma = 0;

    for (let i = 0; i < 10; i++) {
        suma += Number(ruc[i]) * pesos[i];
    }

    const digitoCalculado = (11 - (suma % 11)) % 10;

    return digitoCalculado === Number(ruc[10]);
}

async function obtenerContribuyente(ruc) {
    return await buscarPorRuc(ruc);
}

module.exports = {
    validarRuc,
    obtenerContribuyente
};
