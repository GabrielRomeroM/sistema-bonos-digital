const mongoose = require('mongoose');

const bonoSchema = new mongoose.Schema({
  empleado: {
    nombre: {
      type: String,
      required: [true, 'El nombre del empleado es obligatorio'],
      trim: true
    },
    dni: {
      type: String,
      required: [true, 'El DNI del empleado es obligatorio'],
      trim: true
    },
    puesto: {
      type: String,
      required: [true, 'El puesto del empleado es obligatorio'],
      trim: true
    }
  },
  
  empresa: {
    nombre: {
      type: String,
      required: true,
      default: process.env.EMPRESA_NOMBRE || 'Mi Empresa SA'
    },
    ruc: {
      type: String,
      required: true,
      default: process.env.EMPRESA_RUC || '12345678901'
    }
  },
  
  sueldo: {
    type: Number,
    required: [true, 'El monto del sueldo es obligatorio'],
    min: [0, 'El sueldo no puede ser negativo']
  },
  mes: {
    type: String,
    required: [true, 'El mes del bono es obligatorio'],
    enum: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  },
  anio: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },
  
  firmaDigital: {
    type: String,
    unique: true
  },
  hashDocumento: String,
  
  fechaEmision: {
    type: Date,
    default: Date.now
  },
  fechaFirma: Date,
  
  estado: {
    type: String,
    enum: ['pendiente', 'firmado', 'entregado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

bonoSchema.index({ 'empleado.dni': 1, mes: 1, anio: 1 });
bonoSchema.index({ firmaDigital: 1 });

module.exports = mongoose.model('Bono', bonoSchema);