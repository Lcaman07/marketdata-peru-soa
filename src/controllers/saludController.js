
function obtenerSalud(req, res) {
    res.status(200).json({
        aplicacion: 'MarketData Perú',
        estado: 'Operativo',
        arquitectura: 'SOA',
        mensaje: 'Servidor funcionando correctamente'
    });
}

module.exports = { obtenerSalud };
