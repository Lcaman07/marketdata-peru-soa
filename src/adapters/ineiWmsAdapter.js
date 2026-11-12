
/**
 * MarketData Perú
 * Adaptador del servicio WMS oficial del INEI
 * Obtiene mapas distritales en formato PNG.
 */

const URL_WMS =
    'https://geoespacial.inei.gob.pe/geoserver/Interoperabilidad/wms';

async function obtenerMapaDistrital(
    bbox = '-77.2,-12.3,-76.8,-11.8'
) {
    const parametros = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        layers: 'ig_distrito',
        styles: '',
        format: 'image/png',
        transparent: 'false',
        srs: 'EPSG:4326',
        bbox: bbox,
        width: '800',
        height: '600'
    });

    const respuesta = await fetch(
        `${URL_WMS}?${parametros.toString()}`,
        {
            headers: {
                Accept: 'image/png'
            },
            signal: AbortSignal.timeout(20000)
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            `El INEI WMS respondió HTTP ${respuesta.status}`
        );
    }

    const tipoContenido =
        respuesta.headers.get('content-type') || '';

    if (!tipoContenido.toLowerCase().includes('image/png')) {
        throw new Error(
            'El servicio INEI WMS no devolvió una imagen PNG.'
        );
    }

    // Convertir la respuesta HTTP en datos binarios
    const imagen = Buffer.from(
        await respuesta.arrayBuffer()
    );

    // Verificar la firma del formato PNG
    const firmaPng = Buffer.from([
        137, 80, 78, 71, 13, 10, 26, 10
    ]);

    if (
        imagen.length < 8 ||
        !imagen.subarray(0, 8).equals(firmaPng)
    ) {
        throw new Error('La imagen recibida no es un PNG válido.');
    }

    return imagen;
}

module.exports = {
    obtenerMapaDistrital
};
