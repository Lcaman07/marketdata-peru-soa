
const db = require('../config/database');

async function registrarConsultaEmpresarial({
    ruc,
    estado,
    resultado,
    codigoHttp,
    estadoIntegracion,
    tipoAcceso = 'MYSQL',
    operacion = 'CONSULTAR_RUC',
    mensaje,
    tiempoRespuestaMs = null
}) {
    const conexion = await db.getConnection();

    try {
        await conexion.beginTransaction();

        const [consulta] = await conexion.execute(
            `INSERT INTO consultas
                (tipo_consulta, ruc, estado, resultado)
             VALUES ('EMPRESARIAL', ?, ?, ?)`,
            [
                /^\d{11}$/.test(ruc) ? ruc : null,
                estado,
                JSON.stringify(resultado)
            ]
        );

        const idConsulta = consulta.insertId;

        await conexion.execute(
            `INSERT INTO bitacora_integracion
                (id_consulta, servicio, operacion,
                 tipo_acceso, estado, codigo_http,
                 tiempo_respuesta_ms, mensaje)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idConsulta,
                'SERVICIO_EMPRESARIAL',
                operacion,
                tipoAcceso,
                estadoIntegracion,
                codigoHttp,
                tiempoRespuestaMs,
                mensaje
            ]
        );

        await conexion.commit();

        return idConsulta;

    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

async function listarHistorialEmpresarial() {
    const sql = `
        SELECT
            id_consulta,
            tipo_consulta,
            ruc,
            estado,
            fecha_consulta
        FROM consultas
        WHERE tipo_consulta = 'EMPRESARIAL'
        ORDER BY id_consulta DESC
        LIMIT 20
    `;

    const [registros] = await db.execute(sql);

    return registros;
}

async function listarBitacoraEmpresarial() {
    const sql = `
        SELECT
            b.id_bitacora,
            b.id_consulta,
            c.ruc,
            b.servicio,
            b.operacion,
            b.tipo_acceso,
            b.estado,
            b.codigo_http,
            b.tiempo_respuesta_ms,
            b.mensaje,
            b.fecha_evento
        FROM bitacora_integracion b
        LEFT JOIN consultas c
            ON b.id_consulta = c.id_consulta
        WHERE b.servicio = 'SERVICIO_EMPRESARIAL'
        ORDER BY b.id_bitacora DESC
        LIMIT 20
    `;

    const [registros] = await db.execute(sql);

    return registros;
}

module.exports = {
    registrarConsultaEmpresarial,
    listarHistorialEmpresarial,
    listarBitacoraEmpresarial
};
