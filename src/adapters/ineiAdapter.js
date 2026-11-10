
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

function listarDepartamentos() {
    const contenido = fs.readFileSync(archivoCSV, 'utf8')
        .replace(/^\uFEFF/, '');

    const filas = contenido.split(/\r?\n/);
    const departamentos = new Map();

    // Omitimos la primera fila porque contiene los encabezados
    for (const fila of filas.slice(1)) {
        if (!fila.trim()) continue;

        const datos = fila.split(';');

        const ubigeo = datos[0]?.trim();
        const nombre = datos[1]?.trim();

        if (!/^\d{6}$/.test(ubigeo) || !nombre) {
            continue;
        }

        const codigo = ubigeo.substring(0, 2);

        // Evitar departamentos repetidos
        if (!departamentos.has(codigo)) {
            departamentos.set(codigo, {
                codigo,
                nombre
            });
        }
    }

    return Array.from(departamentos.values())
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}


function listarProvincias(codigoDepartamento) {
    // Validar el código del departamento
    if (typeof codigoDepartamento !== 'string' ||
        !/^[0-9]{2}$/.test(codigoDepartamento)) {
        return [];
    }

    // Leer el archivo CSV del INEI
    const contenido = fs.readFileSync(archivoCSV, 'utf8')
        .replace(/^\uFEFF/, '');

    const filas = contenido.split(/\r?\n/);
    const provincias = new Map();

    for (const fila of filas.slice(1)) {
        if (!fila.trim()) continue;

        const datos = fila.split(';');
        const ubigeo = datos[0]?.trim();
        const nombreProvincia = datos[2]?.trim();

        // Verificar datos válidos
        if (!/^[0-9]{6}$/.test(ubigeo) || !nombreProvincia) {
            continue;
        }

        // Filtrar por departamento
        if (!ubigeo.startsWith(codigoDepartamento)) {
            continue;
        }

        // Los primeros cuatro dígitos identifican la provincia
        const codigoProvincia = ubigeo.substring(0, 4) + '00';

        // Evitar provincias repetidas
        if (!provincias.has(codigoProvincia)) {
            provincias.set(codigoProvincia, {
                codigo: codigoProvincia,
                nombre: nombreProvincia
            });
        }
    }

    return Array.from(provincias.values())
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}


function listarDistritos(codigoProvincia) {

    // Validar el código de la provincia
    if (typeof codigoProvincia !== 'string' ||
        !/^[0-9]{4}00$/.test(codigoProvincia)) {
        return [];
    }

    // Leer archivo del INEI
    const contenido = fs.readFileSync(archivoCSV, 'utf8')
        .replace(/^\uFEFF/, '');

    const filas = contenido.split(/\r?\n/);
    const distritos = new Map();

    // Los primeros 4 dígitos identifican la provincia
    const prefijoProvincia = codigoProvincia.substring(0, 4);

    for (const fila of filas.slice(1)) {
        if (!fila.trim()) continue;

        const datos = fila.split(';');

        const ubigeo = datos[0]?.trim();
        const nombreDistrito = datos[3]?.trim();

        // Validar la información
        if (!/^[0-9]{6}$/.test(ubigeo) || !nombreDistrito) {
            continue;
        }

        // Filtrar los distritos de la provincia
        if (!ubigeo.startsWith(prefijoProvincia)) {
            continue;
        }

        // Evitar distritos duplicados
        if (!distritos.has(ubigeo)) {
            distritos.set(ubigeo, {
                codigo: ubigeo,
                nombre: nombreDistrito
            });
        }
    }

    // Ordenar alfabéticamente
    return Array.from(distritos.values())
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

module.exports = { buscarUbigeo, listarDepartamentos, listarProvincias, listarDistritos };
