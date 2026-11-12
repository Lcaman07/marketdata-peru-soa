
/**
 * MarketData Perú
 * Adaptador WFS oficial del INEI
 * Consulta distritos por UBIGEO mediante GeoJSON
 */

const URL_INEI =
    'https://geoespacial.inei.gob.pe/geoserver/Interoperabilidad/ows';

async function consultarDistritoWfs(ubigeo) {

    // Validar el código territorial
    if (!/^\d{6}$/.test(String(ubigeo))) {
        throw new Error('El UBIGEO debe contener 6 dígitos.');
    }

    // Parámetros del servicio oficial WFS
    const parametros = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'Interoperabilidad:ig_distrito',
        CQL_FILTER: `ubigeo='${ubigeo}'`,
        propertyName: 'ubigeo,nombdist,ccdd,ccpp,ccdi,fuente,periodo',
        maxFeatures: '1',
        outputFormat: 'application/json'
    });

    const url = `${URL_INEI}?${parametros.toString()}`;

    // Consumir el servicio gubernamental en línea
    const respuesta = await fetch(url, {
        headers: {
            Accept: 'application/json'
        },
        signal: AbortSignal.timeout(15000)
    });

    if (!respuesta.ok) {
        throw new Error(
            `El servicio INEI respondió HTTP ${respuesta.status}`
        );
    }

    // Deserializar la respuesta GeoJSON
    let datos;

    try {
        datos = await respuesta.json();
    } catch {
        throw new Error('El INEI no devolvió JSON válido.');
    }

    if (
        datos.type !== 'FeatureCollection' ||
        !Array.isArray(datos.features)
    ) {
        throw new Error('Respuesta WFS del INEI inválida.');
    }

    // Distrito no encontrado
    if (datos.features.length === 0) {
        return null;
    }

    const distrito = datos.features[0].properties;

    if (!distrito || distrito.ubigeo !== ubigeo) {
        throw new Error('El INEI devolvió datos inconsistentes.');
    }

    // Normalizar los datos para MarketData Perú
    return {
        ubigeo: distrito.ubigeo,
        nombre: distrito.nombdist,
        codigoDepartamento: distrito.ccdd,
        codigoProvincia: distrito.ccpp,
        codigoDistrito: distrito.ccdi,
        fuente: distrito.fuente,
        periodo: distrito.periodo,
        proveedor: 'INEI',
        tipoServicio: 'WFS',
        formato: 'GeoJSON',
        modalidad: 'En línea'
    };
}

module.exports = {
    consultarDistritoWfs
};
