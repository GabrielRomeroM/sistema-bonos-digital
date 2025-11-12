const Bono = require('../models/Bono');
const { generarBonoPDF } = require('../utils/pdfGenerator');
const { firmarDocumento, generarHash } = require('../utils/firmaDigital');

// Crear un nuevo bono
const crearBono = async (req, res) => {
  try {
    const { empleado, sueldo, mes, anio } = req.body;

    // Validaciones básicas
    if (!empleado || !empleado.nombre || !empleado.dni || !empleado.puesto) {
      return res.status(400).json({ 
        error: 'Datos del empleado incompletos' 
      });
    }

    if (!sueldo || sueldo <= 0) {
      return res.status(400).json({ 
        error: 'El sueldo debe ser un valor positivo' 
      });
    }

    // Generar firma digital
    const firmaDigital = firmarDocumento(req.body, process.env.CLAVE_PRIVADA_FIRMAS);

    // Generar PDF
    const pdfBuffer = await generarBonoPDF(req.body);
    const hashDocumento = generarHash(pdfBuffer);

    // Crear bono en la base de datos
    const bono = new Bono({
      ...req.body,
      firmaDigital,
      hashDocumento,
      fechaFirma: new Date(),
      estado: 'firmado'
    });

    await bono.save();

    res.status(201).json({
      success: true,
      message: 'Bono creado y firmado exitosamente',
      bono: {
        id: bono._id,
        empleado: bono.empleado,
        mes: bono.mes,
        anio: bono.anio,
        sueldo: bono.sueldo,
        firmaDigital: bono.firmaDigital,
        fechaFirma: bono.fechaFirma
      }
    });

  } catch (error) {
    console.error('Error creando bono:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al crear el bono' 
    });
  }
};

// Obtener todos los bonos
const obtenerBonos = async (req, res) => {
  try {
    const bonos = await Bono.find().sort({ fechaEmision: -1 });
    
    res.json({
      success: true,
      count: bonos.length,
      bonos
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los bonos' });
  }
};

// Obtener un bono por ID
const obtenerBonoPorId = async (req, res) => {
  try {
    const bono = await Bono.findById(req.params.id);
    
    if (!bono) {
      return res.status(404).json({ error: 'Bono no encontrado' });
    }

    res.json({
      success: true,
      bono
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo el bono' });
  }
};

// Verificar firma de un bono
const verificarFirma = async (req, res) => {
  try {
    const bono = await Bono.findById(req.params.id);
    
    if (!bono) {
      return res.status(404).json({ error: 'Bono no encontrado' });
    }

    // Recalcular la firma para verificar
    const firmaVerificada = firmarDocumento(bono.toObject(), process.env.CLAVE_PRIVADA_FIRMAS);
    const esValido = firmaVerificada === bono.firmaDigital;

    res.json({
      success: true,
      esValido,
      firmaOriginal: bono.firmaDigital,
      firmaCalculada: firmaVerificada,
      mensaje: esValido ? '✅ Firma válida' : '❌ Firma inválida'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error verificando la firma' });
  }
};

module.exports = {
  crearBono,
  obtenerBonos,
  obtenerBonoPorId,
  verificarFirma
};