
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');
const db = require('../src/config/database');

const rutaArchivo = path.join(
    __dirname,
    '../data/sunat/padron_reducido_ruc.txt'
);

const TAMANO_LOTE = 200;
const LIMITE_PRUEBA = 1000;

async function guardarLote(registros) {
    if (registros.length === 0) return;

    const marcadores = registros
        .map(() => '(?, ?, ?, ?, ?)')
        .join(', ');

    const sql = `
        INSERT INTO contribuyentes
            (ruc, razon_social, estado, condicion, ubigeo)
        VALUES ${marcadores} AS nuevo
        ON DUPLICATE KEY UPDATE
            razon_social = nuevo.razon_social,
            estado = nuevo.estado,
            condicion = nuevo.condicion,
            ubigeo = nuevo.ubigeo
    `;

    await db.execute(sql, registros.flat());
}

async function importarSunat() {
    const origen = fs.createReadStream(rutaArchivo);
    const entrada = origen.pipe(iconv.decodeStream('win1252'));

    const lector = readline.createInterface({
        input: entrada,
        crlfDelay: Infinity
    });

    let numeroLinea = 0;
    let procesados = 0;
    let omitidos = 0;
    let lote = [];

    try {
        for await (const linea of lector) {
            numeroLinea++;

            if (numeroLinea === 1) continue;

            const campos = linea.split('|');

            const ruc = campos[0]?.trim();
            const razonSocial = campos[1]?.trim();
            const estado = campos[2]?.trim();
            const condicion = campos[3]?.trim();
            const codigoUbigeo = campos[4]?.trim();

            if (
                !/^\d{11}$/.test(ruc) ||
                !razonSocial ||
                razonSocial.length > 300 ||
                estado.length > 50 ||
                condicion.length > 50
            ) {
                omitidos++;
                continue;
            }

            const ubigeo = /^\d{6}$/.test(codigoUbigeo)
                ? codigoUbigeo
                : null;

            lote.push([
                ruc,
                razonSocial,
                estado,
                condicion,
                ubigeo
            ]);

            procesados++;

            if (lote.length >= TAMANO_LOTE) {
                await guardarLote(lote);
                lote = [];
                console.log(`Procesados: ${procesados}`);
            }

            if (procesados >= LIMITE_PRUEBA) break;
        }

        if (lote.length > 0) {
            await guardarLote(lote);
        }

        console.log('Importación de prueba finalizada');
        console.log(`Registros procesados: ${procesados}`);
        console.log(`Registros omitidos: ${omitidos}`);
    } finally {
        lector.close();
        entrada.destroy();
        origen.destroy();
        await db.end();
    }
}

importarSunat().catch(error => {
    console.error('Error de importación:', error.message);
    process.exitCode = 1;
});
