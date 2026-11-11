
const express = require('express');
require('dotenv').config();

const saludRoutes = require('./routes/saludRoutes');
const territorialRoutes = require('./routes/territorialRoutes');
const empresarialRoutes = require('./routes/empresarialRoutes');
const orquestadorRoutes = require('./routes/orquestadorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Configuración para recibir JSON
app.use(express.json());
// Permitir que Express muestre el frontend
app.use(express.static(path.join(__dirname, '../public')));

// Registrar las rutas
app.use('/api/salud', saludRoutes);
app.use('/api/territorio', territorialRoutes);
app.use('/api/empresas', empresarialRoutes);
app.use('/api/orquestador', orquestadorRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`MarketData Perú funcionando en http://localhost:${PORT}`);
});
