
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const iconv = require('iconv-lite');

const rutaArchivo = path.join(
    __dirname,
    '../data/sunat/padron_reducido_ruc.txt'
);

const archivo = fs.createReadStream(rutaArchivo)
    .pipe(iconv.decodeStream('win1252'));

const lector = readline.createInterface({
    input: archivo,
    crlfDelay: Infinity
});

async function leerPadron() {
    let numeroLinea = 0;

    for await (const linea of lector) {
        numeroLinea++;

        if (numeroLinea === 1) {
            console.log('Encabezados:', linea);
            continue;
        }

        const campos = linea.split('|');

        console.log({
            ruc: campos[0],
            razon_social: campos[1],
            estado: campos[2],
            condicion: campos[3],
            ubigeo: campos[4]
        });

        if (numeroLinea >= 6) {
            break;
        }
    }
}

leerPadron().catch(console.error);
