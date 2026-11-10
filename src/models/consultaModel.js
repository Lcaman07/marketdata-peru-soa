
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

module.exports = {
    registrarConsultaEmpresarial
};
