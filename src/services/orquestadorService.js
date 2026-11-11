
/**
 * Servicio Orquestador - MarketData Perú
 * Integra las APIs REST internas de INEI y SUNAT.
 */

const { validarUbigeo } = require('./territorialService');
const { validarRuc } = require('./empresarialService');

const API_BASE = `http://127.0.0.1:${process.env.PORT || 3000}`;

async function consultarServicio(ruta) {
    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        signal: AbortSignal.timeout(10000)
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

    // Consultar ambos servicios REST en paralelo
    const [resultadoTerritorial, resultadoEmpresarial] =
        await Promise.allSettled([
            consultarServicio(`/api/territorio/${ubigeo}`),
            consultarServicio(`/api/empresas/ruc/${ruc}`)
        ]);

    const territorio = resultadoTerritorial.status === 'fulfilled'
        ? resultadoTerritorial.value
        : null;

    const empresa = resultadoEmpresarial.status === 'fulfilled'
        ? resultadoEmpresarial.value
        : null;

    const territorioDisponible = territorio?.codigoHttp === 200;
    const empresaDisponible = empresa?.codigoHttp === 200;

    const ubigeoEmpresa = empresaDisponible
        ? empresa.datos?.datos?.ubigeo
        : null;

    // Solo comparar ubicaciones cuando SUNAT tenga UBIGEO
    const coincideUbigeo = territorioDisponible && ubigeoEmpresa
        ? ubigeoEmpresa === ubigeo
        : null;

    return {
        estado: territorioDisponible && empresaDisponible
            ? 'COMPLETA'
            : territorioDisponible || empresaDisponible
                ? 'PARCIAL'
                : 'ERROR',

        consulta: {
            ubigeo,
            ruc
        },

        territorial: territorio,
        empresarial: empresa,

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
