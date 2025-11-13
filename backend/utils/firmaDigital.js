const crypto = require('crypto');

function generarHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function firmarDocumento(bonoData, clavePrivada) {
  // Usar datos consistentes
  const datosString = JSON.stringify({
    empleado: bonoData.empleado,
    empresa: bonoData.empresa,
    sueldo: bonoData.sueldo,
    mes: bonoData.mes,
    anio: bonoData.anio
  });
  
  const hash = generarHash(datosString + clavePrivada);
  return hash;
}

function verificarFirma(bonoData, firmaDigital, clavePrivada) {
  const firmaCalculada = firmarDocumento(bonoData, clavePrivada);
  return firmaCalculada === firmaDigital;
}

module.exports = { firmarDocumento, verificarFirma, generarHash };