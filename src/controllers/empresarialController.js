
const {
    validarRuc,
    obtenerContribuyente
} = require('../services/empresarialService');

const {
    registrarConsultaEmpresarial
} = require('../models/consultaModel');

async function guardarRegistro(datos) {
    try {
        await registrarConsultaEmpresarial(datos);
    } catch (error) {
        console.error(
            'No se pudo guardar el historial:',
            error.message
        );
    }
}

async function consultarRuc(req, res) {
    const { ruc } = req.params;
    const inicio = process.hrtime.bigint();

    const tiempoTranscurrido = () =>
        Number((process.hrtime.bigint() - inicio) / 1000000n);

    if (!validarRuc(ruc)) {
        const respuesta = {
            estado: 'Error',
            mensaje: 'El RUC ingresado no es válido'
        };

        await guardarRegistro({
            ruc,
            estado: 'ERROR',
            resultado: respuesta,
            codigoHttp: 400,
            estadoIntegracion: 'ERROR',
            tipoAcceso: 'REST',
            mensaje: 'Validación de entrada fallida; no se consultó SUNAT',
            tiempoRespuestaMs: tiempoTranscurrido()
        });

        return res.status(400).json(respuesta);
    }

    try {
        const contribuyente = await obtenerContribuyente(ruc);

        if (!contribuyente) {
            const respuesta = {
                estado: 'No encontrado',
                ruc,
                mensaje: 'El RUC no se encuentra en los registros importados de SUNAT'
            };

            await guardarRegistro({
                ruc,
                estado: 'PARCIAL',
                resultado: respuesta,
                codigoHttp: 404,
                estadoIntegracion: 'EXITO',
                tipoAcceso: 'MYSQL',
                mensaje: 'Consulta local ejecutada sin coincidencias',
                tiempoRespuestaMs: tiempoTranscurrido()
            });

            return res.status(404).json(respuesta);
        }

        const respuesta = {
            estado: 'Consulta correcta',
            servicio: 'Servicio Empresarial',
            fuente: 'Padrón reducido SUNAT - copia local',
            datos: contribuyente
        };

        await guardarRegistro({
            ruc,
            estado: 'COMPLETA',
            resultado: respuesta,
            codigoHttp: 200,
            estadoIntegracion: 'EXITO',
            tipoAcceso: 'MYSQL',
            mensaje: 'Consulta exitosa al padrón local de SUNAT',
            tiempoRespuestaMs: tiempoTranscurrido()
        });

        return res.status(200).json(respuesta);

    } catch (error) {
        console.error('Error empresarial:', error.message);

        const respuesta = {
            estado: 'Error',
            mensaje: 'No se pudo realizar la consulta empresarial'
        };

        await guardarRegistro({
            ruc,
            estado: 'ERROR',
            resultado: respuesta,
            codigoHttp: 500,
            estadoIntegracion: 'ERROR',
            tipoAcceso: 'MYSQL',
            mensaje: 'Error interno durante la consulta empresarial',
            tiempoRespuestaMs: tiempoTranscurrido()
        });

        return res.status(500).json(respuesta);
    }
}

module.exports = {
    consultarRuc
};
