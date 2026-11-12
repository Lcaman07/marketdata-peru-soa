
/**
 * MarketData Perú
 * Consulta los límites geográficos de un distrito
 * mediante el servicio WFS oficial del INEI.
 */

const URL_WFS =
    'https://geoespacial.inei.gob.pe/geoserver/Interoperabilidad/ows';

async function obtenerLimitesDistrito(ubigeo) {

    if (!/^\d{6}$/.test(String(ubigeo))) {
        throw new Error('El UBIGEO debe contener 6 dígitos.');
    }

    const parametros = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'Interoperabilidad:ig_distrito',
        CQL_FILTER: `ubigeo='${ubigeo}'`,
        srsName: 'EPSG:4326',
        maxFeatures: '1',
        outputFormat: 'application/json'
    });

    const respuesta = await fetch(
        `${URL_WFS}?${parametros.toString()}`,
        {
            signal: AbortSignal.timeout(15000)
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            `El INEI WFS respondió HTTP ${respuesta.status}`
        );
    }

    const datos = await respuesta.json();

    if (
        datos.type !== 'FeatureCollection' ||
        !Array.isArray(datos.features)
    ) {
        throw new Error('Respuesta geográfica inválida del INEI.');
    }

    const distrito = datos.features[0];

    if (!distrito) {
        return null;
    }

    if (distrito.properties?.ubigeo !== ubigeo) {
        throw new Error('El UBIGEO recibido no coincide.');
    }

    const coordenadas = distrito.geometry?.coordinates;

    if (!Array.isArray(coordenadas)) {
        throw new Error('El distrito no tiene geometría disponible.');
    }

    // Calcular los límites del distrito
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    function recorrer(coordenadas) {

        if (
            Array.isArray(coordenadas) &&
            typeof coordenadas[0] === 'number' &&
            typeof coordenadas[1] === 'number'
        ) {
            const [lon, lat] = coordenadas;

            if (
                !Number.isFinite(lon) ||
                !Number.isFinite(lat) ||
                Math.abs(lon) > 180 ||
                Math.abs(lat) > 90
            ) {
                throw new Error('Coordenadas geográficas inválidas.');
            }

            minLon = Math.min(minLon, lon);
            minLat = Math.min(minLat, lat);
            maxLon = Math.max(maxLon, lon);
            maxLat = Math.max(maxLat, lat);

            return;
        }

        if (Array.isArray(coordenadas)) {
            coordenadas.forEach(recorrer);
        }
    }

    recorrer(coordenadas);

    if (!Number.isFinite(minLon) ||
        minLon >= maxLon ||
        minLat >= maxLat) {
        throw new Error('No se pudieron calcular los límites.');
    }

    // Agregar un pequeño margen alrededor del distrito
    const margenLon = (maxLon - minLon) * 0.10;
    const margenLat = (maxLat - minLat) * 0.10;

    const bbox = [
        minLon - margenLon,
        minLat - margenLat,
        maxLon + margenLon,
        maxLat + margenLat
    ].join(',');

    return {
        ubigeo,
        distrito: distrito.properties?.nombdist || 'No disponible',
        bbox,
        proveedor: 'INEI',
        servicio: 'WFS'
    };
}

module.exports = {
    obtenerLimitesDistrito
};
