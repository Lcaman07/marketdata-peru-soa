
const db = require('../config/database');

async function registrarAnalisis(resultado, tiempoRespuestaMs) {

    const conexion = await db.getConnection();

    try {
        await conexion.beginTransaction();

        // Guardar el resultado del análisis integrado
        const [consulta] = await conexion.execute(
            `INSERT INTO consultas
                (tipo_consulta, ubigeo, ruc, estado, resultado)
             VALUES ('ANALISIS_ZONA', ?, ?, ?, ?)`,
            [
                resultado.consulta.ubigeo,
                resultado.consulta.ruc,
                resultado.estado,
                JSON.stringify(resultado)
            ]
        );

        const idConsulta = consulta.insertId;

        // Determinar el estado de la integración
        const estadoIntegracion =
            resultado.estado === 'COMPLETA'
                ? 'EXITO'
                : resultado.estado === 'PARCIAL'
                    ? 'PARCIAL'
                    : 'ERROR';

        // Registrar la operación del Orquestador
        await conexion.execute(
            `INSERT INTO bitacora_integracion
                (id_consulta, servicio, operacion,
                 tipo_acceso, estado, codigo_http,
                 tiempo_respuesta_ms, mensaje)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idConsulta,
                'SERVICIO_ORQUESTADOR',
                'ANALIZAR_ZONA_EMPRESA',
                'REST',
                estadoIntegracion,
                200,
                tiempoRespuestaMs,
                'Análisis mediante servicios REST internos con datos locales oficiales'
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

async function listarAnalisisIntegrados() {
    const sql = `
        SELECT
            c.id_consulta,
            c.ubigeo,
            c.ruc,
            c.estado,
            c.fecha_consulta,
            b.tiempo_respuesta_ms
        FROM consultas c
        LEFT JOIN bitacora_integracion b
            ON c.id_consulta = b.id_consulta
            AND b.servicio = 'SERVICIO_ORQUESTADOR'
        WHERE c.tipo_consulta = 'ANALISIS_ZONA'
        ORDER BY c.id_consulta DESC
        LIMIT 20
    `;

    const [registros] = await db.execute(sql);

    return registros;
}

module.exports = {
    registrarAnalisis,
    listarAnalisisIntegrados
};
