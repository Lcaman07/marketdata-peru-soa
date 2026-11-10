



const { buscarUbigeo, listarDepartamentos, listarProvincias, listarDistritos } = require('../adapters/ineiAdapter');

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

// Obtener la lista de departamentos del Perú
function obtenerDepartamentos() {
    const departamentos = listarDepartamentos();

    return {
        total: departamentos.length,
        fuente: 'INEI - Archivo UBIGEO 2022',
        departamentos: departamentos
    };
}


// Obtener las provincias de un departamento
function obtenerProvincias(codigoDepartamento) {

    // Validar que el departamento tenga 2 dígitos
    if (typeof codigoDepartamento !== 'string' ||
        !/^[0-9]{2}$/.test(codigoDepartamento)) {
        throw new Error('El código del departamento debe tener 2 números');
    }

    // Consultar las provincias mediante el adaptador
    const provincias = listarProvincias(codigoDepartamento);

    return {
        codigoDepartamento,
        total: provincias.length,
        fuente: 'INEI - Archivo UBIGEO 2022',
        provincias
    };
}

// Obtener los distritos de una provincia
function obtenerDistritos(codigoProvincia) {

    // Validar el código de provincia
    if (typeof codigoProvincia !== 'string' ||
        !/^[0-9]{4}00$/.test(codigoProvincia)) {
        throw new Error(
            'El código de provincia debe tener 6 números y terminar en 00'
        );
    }

    // Consultar el adaptador del INEI
    const distritos = listarDistritos(codigoProvincia);

    // Preparar respuesta para MarketData
    return {
        codigoProvincia,
        total: distritos.length,
        fuente: 'INEI - Archivo UBIGEO 2022',
        distritos
    };
}


module.exports = {
    validarUbigeo,
    consultarUbigeo,
    obtenerDepartamentos,
    obtenerProvincias,
    obtenerDistritos
};
