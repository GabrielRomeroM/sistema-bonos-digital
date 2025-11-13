const Bono = require('../models/Bono');

// Obtener estadísticas generales
const obtenerEstadisticas = async (req, res) => {
  try {
    const totalBonos = await Bono.countDocuments();
    const bonosFirmados = await Bono.countDocuments({ estado: 'firmado' });
    const bonosPendientes = await Bono.countDocuments({ estado: 'pendiente' });
    const bonosEntregados = await Bono.countDocuments({ estado: 'entregado' });

    // Total de sueldos pagados
    const resultadoSueldos = await Bono.aggregate([
      {
        $group: {
          _id: null,
          totalSueldos: { $sum: '$sueldo' },
          promedioSueldo: { $avg: '$sueldo' }
        }
      }
    ]);

    // Bonos por mes
    const bonosPorMes = await Bono.aggregate([
      {
        $group: {
          _id: { mes: '$mes', anio: '$anio' },
          cantidad: { $sum: 1 },
          total: { $sum: '$sueldo' }
        }
      },
      { $sort: { '_id.anio': -1, '_id.mes': 1 } }
    ]);

    // Últimos 5 bonos
    const ultimosBonos = await Bono.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('empleado.nombre empleado.dni sueldo mes anio estado fechaFirma createdAt');

    const estadisticas = {
      totalBonos,
      bonosFirmados,
      bonosPendientes,
      bonosEntregados,
      totalSueldos: resultadoSueldos[0]?.totalSueldos || 0,
      promedioSueldo: resultadoSueldos[0]?.promedioSueldo || 0
    };

    res.json({
      success: true,
      estadisticas,
      bonosPorMes,
      ultimosBonos
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error obteniendo estadísticas' 
    });
  }
};

// Obtener bonos con filtros
const obtenerBonosFiltrados = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      estado, 
      mes, 
      anio,
      empleado 
    } = req.query;

    // Construir filtros
    const filtro = {};
    
    if (estado && estado !== 'todos') {
      filtro.estado = estado;
    }
    
    if (mes && mes !== 'todos') {
      filtro.mes = mes;
    }
    
    if (anio) {
      filtro.anio = parseInt(anio);
    }
    
    if (empleado) {
      filtro['empleado.nombre'] = { $regex: empleado, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const bonos = await Bono.find(filtro)
      .sort({ fechaEmision: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('empleado sueldo mes anio estado fechaFirma firmaDigital createdAt');

    const total = await Bono.countDocuments(filtro);

    res.json({
      success: true,
      bonos,
      paginacion: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo bonos filtrados:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error obteniendo bonos' 
    });
  }
};

// Obtener empleados únicos para filtros
const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Bono.distinct('empleado.nombre');
    
    res.json({
      success: true,
      empleados: empleados.sort()
    });

  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error obteniendo empleados' 
    });
  }
};

module.exports = {
  obtenerEstadisticas,
  obtenerBonosFiltrados,
  obtenerEmpleados
};