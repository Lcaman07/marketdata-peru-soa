
const express = require('express');
require('dotenv').config();

const saludRoutes = require('./routes/saludRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para recibir JSON
app.use(express.json());

// Registrar las rutas
app.use('/api/salud', saludRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`MarketData Perú funcionando en http://localhost:${PORT}`);
});
