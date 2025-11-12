require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

// Conectar a la base de datos
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/bonos', require('./routes/bonos'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend del Sistema de Bonos funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MongoDB conectada'
  });
});

// Ruta de salud de la base de datos
app.get('/api/db-status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    res.json({
      database: mongoose.connection.readyState === 1 ? 'Conectada' : 'Desconectada',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: ['Bono']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ruta de prueba: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Estado BD: http://localhost:${PORT}/api/db-status`);
  console.log(`💰 Rutas de bonos: http://localhost:${PORT}/api/bonos`);
});