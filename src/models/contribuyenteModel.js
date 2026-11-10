
const db = require('../config/database');

async function buscarPorRuc(ruc) {
    const sql = `
        SELECT
            ruc,
            razon_social,
            estado,
            condicion,
            ubigeo
        FROM contribuyentes
        WHERE ruc = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [ruc]);

    return rows[0] || null;
}

module.exports = {
    buscarPorRuc
};
