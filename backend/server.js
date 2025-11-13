require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const path = require('path');

// Conectar a la base de datos
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api/bonos', require('./routes/bonos'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Ruta para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend del Sistema de Bonos funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MongoDB conectada'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Ruta 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// Ruta 404 para frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});