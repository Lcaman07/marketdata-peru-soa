
/**
 * Servicio Orquestador - MarketData Perú
 * Integra las APIs REST internas de INEI y SUNAT.
 */

const { validarUbigeo } = require('./territorialService');
const { validarRuc } = require('./empresarialService');

const API_BASE = `http://127.0.0.1:${process.env.PORT || 3000}`;

async function consultarServicio(ruta, tiempoMaximo = 10000) {
    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        signal: AbortSignal.timeout(tiempoMaximo)
    });

    const datos = await respuesta.json();

    return {
        codigoHttp: respuesta.status,
        datos
    };
}

async function analizarZonaEmpresa(ubigeo, ruc) {

    if (!validarUbigeo(ubigeo)) {
        throw new Error('El UBIGEO debe tener 6 dígitos');
    }

    if (!validarRuc(ruc)) {
        throw new Error('El RUC ingresado no es válido');
    }


    // Consultar los tres servicios REST en paralelo
    const [
        resultadoTerritorial,
        resultadoEmpresarial,
        resultadoIneiEnLinea
    ] = await Promise.allSettled([
        consultarServicio(`/api/territorio/${ubigeo}`),
        consultarServicio(`/api/empresas/ruc/${ruc}`),
        consultarServicio(`/api/territorio/wfs/${ubigeo}`, 20000)
    ]);


    const territorio = resultadoTerritorial.status === 'fulfilled'
        ? resultadoTerritorial.value
        : null;

    const empresa = resultadoEmpresarial.status === 'fulfilled'
        ? resultadoEmpresarial.value
        : null;


    // Resultado de la consulta al INEI oficial en línea
    const ineiEnLinea = resultadoIneiEnLinea.status === 'fulfilled'
        ? resultadoIneiEnLinea.value
        : null;


    const territorioDisponible = territorio?.codigoHttp === 200;
    const empresaDisponible = empresa?.codigoHttp === 200;
    const ineiEnLineaDisponible = ineiEnLinea?.codigoHttp === 200;

    const ubigeoEmpresa = empresaDisponible
        ? empresa.datos?.datos?.ubigeo
        : null;

    // Solo comparar ubicaciones cuando SUNAT tenga UBIGEO
    const coincideUbigeo = territorioDisponible && ubigeoEmpresa
        ? ubigeoEmpresa === ubigeo
        : null;

    return {

        estado: territorioDisponible &&
                empresaDisponible &&
                ineiEnLineaDisponible
            ? 'COMPLETA'
            : territorioDisponible ||
              empresaDisponible ||
              ineiEnLineaDisponible
                ? 'PARCIAL'
                : 'ERROR',


        consulta: {
            ubigeo,
            ruc
        },

territorial: territorio,
empresarial: empresa,
ineiEnLinea: ineiEnLinea,

        comparacion: {
            coincideUbigeo,
            mensaje: coincideUbigeo === null
                ? 'No hay datos suficientes para comprobar la ubicación empresarial'
                : coincideUbigeo
                    ? 'El UBIGEO empresarial coincide con la zona consultada'
                    : 'El UBIGEO empresarial corresponde a otra zona'
        }
    };
}

module.exports = {
    analizarZonaEmpresa
};
