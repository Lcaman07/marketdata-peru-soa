
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



const [
    resultadoTerritorial,
    resultadoEmpresarial,
    resultadoIneiEnLinea,
    resultadoEmpresarialEnLinea
] = await Promise.allSettled([
    // INEI: información territorial y poblacional local
    consultarServicio(`/api/territorio/${ubigeo}`),

    // SUNAT: padrón almacenado en MySQL
    consultarServicio(`/api/empresas/ruc/${ruc}`),

    // INEI: servicio WFS oficial en línea
    consultarServicio(`/api/territorio/wfs/${ubigeo}`, 20000),

    // OpenRUC: consulta REST para RUC que empiezan con 20
    ruc.startsWith('20')
        ? consultarServicio(`/api/empresas/online/${ruc}`, 15000)
        : Promise.resolve(null)
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


// Información empresarial obtenida desde OpenRUC
const empresarialEnLinea =
    resultadoEmpresarialEnLinea.status === 'fulfilled'
        ? resultadoEmpresarialEnLinea.value
        : null;



    // Comprobar disponibilidad de los servicios
    const territorioDisponible = territorio?.codigoHttp === 200;

    const empresaLocalDisponible = empresa?.codigoHttp === 200;

    const empresaOnlineDisponible =
        empresarialEnLinea?.codigoHttp === 200;

    const ineiEnLineaDisponible =
        ineiEnLinea?.codigoHttp === 200;

    // La información empresarial puede provenir
    // de MySQL o del proveedor externo OpenRUC
    const empresaDisponible =
        empresaLocalDisponible || empresaOnlineDisponible;

    // Recuperar UBIGEO de ambas fuentes empresariales
    const ubigeoLocal = empresaLocalDisponible
        ? empresa.datos?.datos?.ubigeo
        : null;

    const ubigeoOnline = empresaOnlineDisponible
        ? empresarialEnLinea.datos?.datos?.ubigeo
        : null;

    // Validar que el UBIGEO tenga seis dígitos
    const esUbigeoValido = valor =>
        /^\d{6}$/.test(String(valor ?? ''));

    // Dar prioridad al padrón local cuando tenga UBIGEO
    const ubigeoEmpresa = esUbigeoValido(ubigeoLocal)
        ? String(ubigeoLocal)
        : esUbigeoValido(ubigeoOnline)
            ? String(ubigeoOnline)
            : null;

    // Identificar de dónde procede el UBIGEO empresarial
    const fuenteUbigeo = esUbigeoValido(ubigeoLocal)
        ? 'SUNAT - Padrón local'
        : esUbigeoValido(ubigeoOnline)
            ? 'OpenRUC - Proveedor externo'
            : null;

    // Comparar únicamente cuando existan datos suficientes
    const coincideUbigeo =
        territorioDisponible && ubigeoEmpresa !== null
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
empresarialEnLinea: empresarialEnLinea,


comparacion: {
    coincideUbigeo,
    ubigeoEmpresa,
    fuenteUbigeo,
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
