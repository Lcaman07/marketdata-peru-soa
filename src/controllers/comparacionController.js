
const {
    compararDistritos
} = require('../services/comparacionService');

function consultarComparacion(req, res) {
    const { ubigeoA, ubigeoB } = req.params;

    try {
        const resultado = compararDistritos(ubigeoA, ubigeoB);

        return res.status(200).json({
            servicio: 'Comparación Territorial',
            ...resultado
        });

    } catch (error) {
        if (error.message.includes('no existe')) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: error.message
            });
        }

        if (
            error.message.includes('6 dígitos') ||
            error.message.includes('diferentes')
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: error.message
            });
        }

        console.error('Error de comparación:', error.message);

        return res.status(500).json({
            estado: 'ERROR',
            mensaje: 'No se pudo realizar la comparación territorial'
        });
    }
}

module.exports = {
    consultarComparacion
};
