
/**
 * MarketData Perú
 * Adaptador REST para consultar OpenRUC.
 *
 * OpenRUC es un proveedor externo que utiliza
 * datos declarados como provenientes de SUNAT.
 * No es una API oficial de SUNAT.
 */

const URL_OPENRUC = 'https://openruc.com/api/ruc';

async function consultarRucOnline(ruc) {

    const numeroRuc = String(ruc);

    // Este proveedor admite RUC de personas jurídicas
    if (!/^20\d{9}$/.test(numeroRuc)) {
        throw new Error(
            'OpenRUC solo admite RUC de 11 dígitos que empiezan con 20.'
        );
    }

    const respuesta = await fetch(
        `${URL_OPENRUC}/${numeroRuc}`,
        {
            headers: {
                Accept: 'application/json'
            },
            signal: AbortSignal.timeout(10000)
        }
    );

    if (respuesta.status === 404) {
        return null;
    }

    if (!respuesta.ok) {
        throw new Error(
            `OpenRUC respondió HTTP ${respuesta.status}`
        );
    }

    const datos = await respuesta.json();

    // Validar que corresponda al RUC solicitado
    if (
        !datos ||
        String(datos.ruc) !== numeroRuc ||
        !datos.razon_social
    ) {
        throw new Error(
            'La API devolvió información empresarial inválida.'
        );
    }

    // Normalizar y limitar los campos recibidos
    return {
        ruc: numeroRuc,
        razon_social: datos.razon_social,
        estado: datos.estado || null,
        condicion: datos.condicion || null,
        direccion: datos.direccion || null,
        ubigeo: /^\d{6}$/.test(String(datos.ubigeo ?? ''))
            ? String(datos.ubigeo)
            : null,
        fechaActualizacion: datos.as_of || null,
        proveedor: 'OpenRUC',
        fuenteDeclarada: datos.source || null,
        modalidad: 'REST en línea',
        oficialSunat: false
    };
}

module.exports = {
    consultarRucOnline
};
