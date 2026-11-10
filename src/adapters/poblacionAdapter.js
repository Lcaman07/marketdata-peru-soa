
const fs = require('fs');
const path = require('path');

// Archivo de población del INEI
const archivoCSV = path.join(
    __dirname,
    '../../data/inei/poblacion_inei_2018_2026.csv'
);

function buscarPoblacion(ubigeo) {

    const codigo = String(ubigeo);

    if (!/^[0-9]{6}$/.test(codigo)) {
        return null;
    }

    const contenido = fs.readFileSync(archivoCSV, 'utf8')
        .replace(/^\uFEFF/, '');

    const filas = contenido.split(/\r?\n/);

    for (const fila of filas) {

        const datos = fila.split(';');

        if (datos[0]?.trim() !== codigo) {
            continue;
        }

        // Obtener población por año
        const poblacionPorAnio = {};

        for (let anio = 2018; anio <= 2026; anio++) {

            const indice = anio - 2018 + 2;
            const valor = datos[indice]?.trim();

            poblacionPorAnio[anio] = valor
                ? Number(valor.replace(/,/g, ''))
                : null;
        }

        // Identificar el nivel territorial
        const nivel = codigo === '000000'
            ? 'pais'
            : codigo.endsWith('0000')
                ? 'departamento'
                : codigo.endsWith('00')
                    ? 'provincia'
                    : 'distrito';

        return {
            ubigeo: codigo,
            nombre: datos[1]?.trim(),
            nivel,
            poblacion2026: poblacionPorAnio[2026],
            poblacionPorAnio,
            fuente: 'INEI',
            tipoDato: 'Población proyectada al 30 de junio'
        };
    }

    return null;
}

module.exports = { buscarPoblacion };
