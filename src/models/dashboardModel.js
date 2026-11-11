
const db = require('../config/database');

async function obtenerIndicadoresEmpresariales() {

    const sql = `
        SELECT
            COUNT(*) AS contribuyentesImportados,

            COUNT(
                CASE WHEN estado = 'ACTIVO'
                THEN 1 END
            ) AS activos,

            COUNT(
                CASE WHEN condicion = 'HABIDO'
                THEN 1 END
            ) AS habidos,

            COUNT(ubigeo) AS conUbigeo

        FROM contribuyentes
    `;

    const [registros] = await db.execute(sql);

    return {
        ...registros[0],
        fuente: 'Padrón reducido SUNAT - copia local',
        alcance: 'Registros importados en MySQL'
    };
}

module.exports = {
    obtenerIndicadoresEmpresariales
};
