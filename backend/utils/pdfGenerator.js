const PDFDocument = require('pdfkit');

function generarBonoPDF(bonoData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Contenido del PDF
      doc.fontSize(20).text('BONO DE SUELDO DIGITAL', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12)
         .text(`Empleado: ${bonoData.empleado.nombre}`)
         .text(`DNI: ${bonoData.empleado.dni}`)
         .text(`Puesto: ${bonoData.empleado.puesto}`);
      
      doc.moveDown();
      doc.text(`Empresa: ${bonoData.empresa?.nombre || 'Mi Empresa SA'}`)
         .text(`RUC: ${bonoData.empresa?.ruc || '12345678901'}`);
      
      doc.moveDown();
      doc.text(`Sueldo: $${bonoData.sueldo}`)
         .text(`Mes: ${bonoData.mes}`)
         .text(`Año: ${bonoData.anio || new Date().getFullYear()}`);
      
      doc.moveDown();
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`)
         .text(`Este documento cuenta con firma digital`);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generarBonoPDF };