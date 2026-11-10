


const {
    validarUbigeo,
    consultarUbigeo,
    obtenerDepartamentos,
    obtenerProvincias,
    obtenerDistritos
} = require('../services/territorialService');


// Consultar información territorial por UBIGEO
function consultarTerritorio(req, res) {
    const { ubigeo } = req.params;

    if (!validarUbigeo(ubigeo)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El UBIGEO debe contener exactamente 6 números'
        });
    }

    try {
        const territorio = consultarUbigeo(ubigeo);

        if (!territorio) {
            return res.status(404).json({
                estado: 'No encontrado',
                mensaje: 'El UBIGEO no existe en los datos disponibles del INEI'
            });
        }

        return res.status(200).json({
            estado: 'Correcto',
            fuente: 'INEI - Archivo UBIGEO 2022',
            datos: territorio
        });

    } catch (error) {
        console.error('Error territorial:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo consultar la información territorial'
        });
    }
}

// Consultar todos los departamentos
function consultarDepartamentos(req, res) {
    try {
        const resultado = obtenerDepartamentos();

        return res.status(200).json(resultado);

    } catch (error) {
        console.error('Error al listar departamentos:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo obtener la lista de departamentos'
        });
    }
}

// Consultar las provincias de un departamento
function consultarProvincias(req, res) {
    const { codigoDepartamento } = req.params;

    // Validar el código del departamento
    if (!/^[0-9]{2}$/.test(codigoDepartamento)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El código del departamento debe contener 2 números'
        });
    }

    try {
        const resultado = obtenerProvincias(codigoDepartamento);

        if (resultado.total === 0) {
            return res.status(404).json({
                estado: 'No encontrado',
                mensaje: 'No se encontraron provincias para este departamento'
            });
        }

        return res.status(200).json({
            estado: 'Correcto',
            ...resultado
        });

    } catch (error) {
        console.error('Error al consultar provincias:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo consultar la lista de provincias'
        });
    }
}


// Consultar los distritos de una provincia
function consultarDistritos(req, res) {
    const { codigoProvincia } = req.params;

    // Validar el código de provincia
    if (!/^[0-9]{4}00$/.test(codigoProvincia)) {
        return res.status(400).json({
            estado: 'Error',
            mensaje: 'El código de provincia debe tener 6 números y terminar en 00'
        });
    }

    try {
        // Consultar el Servicio Territorial
        const resultado = obtenerDistritos(codigoProvincia);

        if (resultado.total === 0) {
            return res.status(404).json({
                estado: 'No encontrado',
                mensaje: 'No se encontraron distritos para esta provincia'
            });
        }

        return res.status(200).json({
            estado: 'Correcto',
            ...resultado
        });

    } catch (error) {
        console.error('Error al consultar distritos:', error.message);

        return res.status(500).json({
            estado: 'Error',
            mensaje: 'No se pudo consultar la lista de distritos'
        });
    }
}

module.exports = {
    consultarTerritorio,
    consultarDepartamentos,
    consultarProvincias,
    consultarDistritos
};
