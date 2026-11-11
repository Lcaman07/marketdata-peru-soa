
const {
    analizarZonaEmpresa
} = require('../services/orquestadorService');

const {
    validarUbigeo
} = require('../services/territorialService');

const {
    validarRuc
} = require('../services/empresarialService');

const {
    registrarAnalisis
} = require('../models/orquestadorModel');

async function consultarAnalisis(req, res) {

    const { ubigeo, ruc } = req.params;

    // Validar los datos de entrada
    if (!validarUbigeo(ubigeo)) {
        return res.status(400).json({
            estado: 'ERROR',
            mensaje: 'El UBIGEO debe tener exactamente 6 dígitos'
        });
    }

    if (!validarRuc(ruc)) {
        return res.status(400).json({
            estado: 'ERROR',
            mensaje: 'El RUC ingresado no es válido'
        });
    }

    const inicio = process.hrtime.bigint();

    try {
        // Ejecutar ambos servicios mediante el Orquestador
        const resultado = await analizarZonaEmpresa(ubigeo, ruc);

        const tiempoRespuestaMs = Number(
            (process.hrtime.bigint() - inicio) / 1000000n
        );

        // Registrar el análisis y su bitácora
        try {
            const idConsulta = await registrarAnalisis(
                resultado,
                tiempoRespuestaMs
            );

            console.log(
                `Análisis integrado registrado: ${idConsulta}`
            );

        } catch (error) {
            console.error(
                'Error al guardar el análisis:',
                error.message
            );
        }

        // Entregar el resultado de la consulta
        return res.status(200).json(resultado);

    } catch (error) {
        console.error(
            'Error del Orquestador:',
            error.message
        );

        return res.status(500).json({
            estado: 'ERROR',
            mensaje: 'No se pudo completar el análisis integrado'
        });
    }
}

module.exports = {
    consultarAnalisis
};
