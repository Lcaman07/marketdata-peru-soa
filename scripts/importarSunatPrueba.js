
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');
const db = require('../src/config/database');

const rutaArchivo = path.join(
    __dirname,
    '../data/sunat/padron_reducido_ruc.txt'
);

async function importarPrueba() {
    const archivo = fs.createReadStream(rutaArchivo)
        .pipe(iconv.decodeStream('win1252'));

    const lector = readline.createInterface({
        input: archivo,
        crlfDelay: Infinity
    });

    let numeroLinea = 0;
    let registros = 0;

    try {
        for await (const linea of lector) {
            numeroLinea++;

            if (numeroLinea === 1) continue;

            const campos = linea.split('|');

            const ruc = campos[0]?.trim();
            const razonSocial = campos[1]?.trim();
            const estado = campos[2]?.trim();
            const condicion = campos[3]?.trim();
            const ubigeo = campos[4]?.trim();

            if (!/^\d{11}$/.test(ruc) || !razonSocial) {
                continue;
            }

            const sql = `
                INSERT INTO contribuyentes
                    (ruc, razon_social, estado, condicion, ubigeo)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    razon_social = ?,
                    estado = ?,
                    condicion = ?,
                    ubigeo = ?
            `;

            const valores = [
                ruc,
                razonSocial,
                estado,
                condicion,
                ubigeo === '-' || !ubigeo ? null : ubigeo,
                razonSocial,
                estado,
                condicion,
                ubigeo === '-' || !ubigeo ? null : ubigeo
            ];

            await db.execute(sql, valores);

            registros++;

            console.log(`Registro procesado: ${ruc}`);

            if (registros >= 5) break;
        }

        console.log(`Total procesado: ${registros}`);
    } finally {
        lector.close();
        archivo.destroy();
        await db.end();
    }
}

importarPrueba().catch(console.error);
