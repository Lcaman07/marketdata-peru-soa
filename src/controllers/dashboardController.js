
const {
    obtenerIndicadoresEmpresariales
} = require('../models/dashboardModel');


const {
    obtenerDepartamentos,
    consultarUbigeo,
    validarUbigeo
} = require('../services/territorialService');


// Indicadores empresariales SUNAT
async function consultarIndicadores(req, res) {
    try {
        const indicadores = await obtenerIndicadoresEmpresariales();

        return res.status(200).json({
            estado: 'Consulta correcta',
            servicio: 'Dashboard MarketData Perú',
            datos: indicadores
        });

    } catch (error) {
        console.error('Error al consultar indicadores:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudieron obtener los indicadores'
        });
    }
}

// Indicadores territoriales INEI
async function consultarIndicadoresTerritoriales(req, res) {
    try {
        const resultado = obtenerDepartamentos();

        return res.status(200).json({
            estado: 'Consulta correcta',
            servicio: 'Dashboard Territorial',
            datos: {
                departamentosYCallao: resultado.total,
                fuente: resultado.fuente,
                alcance: 'Unidades disponibles en el catálogo INEI'
            }
        });

    } catch (error) {
        console.error('Error en indicadores territoriales:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudieron obtener los indicadores territoriales'
        });
    }
}

async function consultarIndicadorPoblacion(req, res) {
    const { ubigeo } = req.params;

    if (!validarUbigeo(ubigeo)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El UBIGEO debe contener exactamente 6 dígitos'
        });
    }

    try {
        const territorio = consultarUbigeo(ubigeo);

        if (!territorio) {
            return res.status(404).json({
                estado: 'No encontrado',
                mensaje: 'El UBIGEO no está disponible en el catálogo INEI'
            });
        }

        return res.status(200).json({
            estado: territorio.poblacion
                ? 'Consulta correcta'
                : 'Datos parciales',

            servicio: 'Dashboard Poblacional',

            datos: {
                ubigeo: territorio.ubigeo,
                departamento: territorio.departamento,
                provincia: territorio.provincia,
                distrito: territorio.distrito,
                poblacion: territorio.poblacion
            }
        });

    } catch (error) {
        console.error('Error de población:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo consultar el indicador poblacional'
        });
    }
}

module.exports = {
    consultarIndicadores,
    consultarIndicadoresTerritoriales,
    consultarIndicadorPoblacion
};
