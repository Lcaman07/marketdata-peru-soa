
const fs = require('fs');
const path = require('path');

// Ubicación del archivo oficial del INEI
const archivoCSV = path.join(
    __dirname,
    '../../data/inei/ubigeo_inei.csv'
);

function buscarUbigeo(ubigeo) {

    // Leer el archivo CSV
    const contenido = fs.readFileSync(archivoCSV, 'utf8')
        .replace(/^\uFEFF/, '');

    // Separar las filas
    const [encabezado, ...filas] = contenido.split(/\r?\n/);

    // Identificar las columnas
    const columnas = encabezado.split(';').map(c => c.trim());

    const indiceUbigeo = columnas.indexOf('IDDIST');

    if (indiceUbigeo === -1) {
        throw new Error('No se encontró la columna IDDIST');
    }

    // Buscar el UBIGEO solicitado
    for (const fila of filas) {
        if (!fila.trim()) continue;

        const datos = fila.split(';');

        if (datos[indiceUbigeo]?.trim() === String(ubigeo)) {
            const obtener = (nombre) =>
                datos[columnas.indexOf(nombre)]?.trim() || null;

            return {
                ubigeo: obtener('IDDIST'),
                departamento: obtener('NOMBDEP'),
                provincia: obtener('NOMBPROV'),
                distrito: obtener('NOMBDIST'),
                capital: obtener('NOM_CAPITAL (LEGAL)'),
                codigoRegionNatural: obtener('COD_ REG_NAT'),
                regionNatural: obtener('REGION NATURAL')
            };
        }
    }

    return null;
}

module.exports = { buscarUbigeo };
