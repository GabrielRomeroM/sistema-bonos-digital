const API_BASE = '/api';

// Cargar dashboard al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
    cargarBonos();
    cargarUltimosBonos();
});

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/estadisticas`);
        const data = await response.json();

        if (data.success) {
            const stats = data.estadisticas;
            document.getElementById('totalBonos').textContent = stats.totalBonos;
            document.getElementById('bonosFirmados').textContent = stats.bonosFirmados;
            document.getElementById('bonosPendientes').textContent = stats.bonosPendientes;
            document.getElementById('totalSueldos').textContent = `$${stats.totalSueldos.toLocaleString()}`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById('totalBonos').textContent = 'Error';
    }
}

// Cargar bonos con filtros
async function cargarBonos(page = 1) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('bonosContainer');
    const pagination = document.getElementById('pagination');

    loading.style.display = 'block';
    container.innerHTML = '';

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            estado: document.getElementById('filterEstado').value,
            mes: document.getElementById('filterMes').value,
            anio: document.getElementById('filterAnio').value,
            empleado: document.getElementById('filterEmpleado').value
        });

        const response = await fetch(`${API_BASE}/dashboard/bonos?${params}`);
        const data = await response.json();

        if (data.success) {
            mostrarBonos(data.bonos);
            mostrarPaginacion(data.paginacion);
        }
    } catch (error) {
        console.error('Error cargando bonos:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                <h3>Error cargando los bonos</h3>
                <p>${error.message}</p>
                <button onclick="cargarBonos()" class="btn-primary">Reintentar</button>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Mostrar bonos en la lista
function mostrarBonos(bonos) {
    const container = document.getElementById('bonosContainer');

    if (bonos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <h3>No se encontraron bonos</h3>
                <p>No hay bonos que coincidan con los filtros aplicados.</p>
            </div>
        `;
        return;
    }

    bonos.forEach(bono => {
        const bonoElement = document.createElement('div');
        bonoElement.className = 'bono-card';
        
        const fecha = new Date(bono.createdAt).toLocaleDateString();
        
        bonoElement.innerHTML = `
            <div class="bono-info">
                <h4>${bono.empleado.nombre}</h4>
                <div class="bono-meta">
                    <strong>DNI:</strong> ${bono.empleado.dni} | 
                    <strong>Sueldo:</strong> $${bono.sueldo.toLocaleString()} | 
                    <strong>Periodo:</strong> ${bono.mes} ${bono.anio}
                </div>
                <div class="bono-meta">
                    <strong>Creado:</strong> ${fecha}
                </div>
            </div>
            <div class="bono-actions">
                <span class="bono-status status-${bono.estado}">
                    ${bono.estado.toUpperCase()}
                </span>
                <button onclick="verificarFirma('${bono._id}')" class="btn-primary" style="margin-left: 10px;">
                    🔍 Verificar
                </button>
            </div>
        `;

        container.appendChild(bonoElement);
    });
}

// Mostrar paginación
function mostrarPaginacion(paginacion) {
    const container = document.getElementById('pagination');
    
    if (paginacion.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';

    // Botón anterior
    if (paginacion.page > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.innerHTML = '&laquo; Anterior';
        prevButton.onclick = () => cargarBonos(paginacion.page - 1);
        container.appendChild(prevButton);
    }

    // Números de página
    for (let i = 1; i <= paginacion.pages; i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === paginacion.page ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => cargarBonos(i);
        container.appendChild(button);
    }

    // Botón siguiente
    if (paginacion.page < paginacion.pages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.innerHTML = 'Siguiente &raquo;';
        nextButton.onclick = () => cargarBonos(paginacion.page + 1);
        container.appendChild(nextButton);
    }
}

// Cargar últimos bonos
async function cargarUltimosBonos() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/estadisticas`);
        const data = await response.json();

        if (data.success && data.ultimosBonos) {
            const container = document.getElementById('recentBonos');
            container.innerHTML = '';
            
            if (data.ultimosBonos.length === 0) {
                container.innerHTML = '<p>No hay bonos recientes</p>';
                return;
            }
            
            data.ultimosBonos.forEach(bono => {
                const bonoElement = document.createElement('div');
                bonoElement.className = 'recent-bono';
                
                const fecha = new Date(bono.createdAt).toLocaleDateString();
                
                bonoElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${bono.empleado.nombre}</strong>
                            <div>$${bono.sueldo.toLocaleString()} - ${bono.mes} ${bono.anio}</div>
                            <small>${fecha}</small>
                        </div>
                        <span class="bono-status status-${bono.estado}" style="font-size: 10px;">
                            ${bono.estado.toUpperCase()}
                        </span>
                    </div>
                `;

                container.appendChild(bonoElement);
            });
        }
    } catch (error) {
        console.error('Error cargando últimos bonos:', error);
    }
}

// Verificar firma de un bono
async function verificarFirma(bonoId) {
    try {
        const response = await fetch(`${API_BASE}/bonos/${bonoId}/verificar-firma`);
        const data = await response.json();

        if (data.success) {
            alert(`${data.mensaje}`);
        } else {
            alert('Error verificando la firma');
        }
    } catch (error) {
        console.error('Error verificando firma:', error);
        alert('Error verificando la firma');
    }
}

// Función para crear bono de prueba
async function crearBonoPrueba() {
    try {
        const bonoPrueba = {
            empleado: {
                nombre: "Empleado Prueba",
                dni: "99999999",
                puesto: "Desarrollador"
            },
            sueldo: 5000,
            mes: "Noviembre",
            anio: 2024
        };

        const response = await fetch(`${API_BASE}/bonos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bonoPrueba)
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Bono de prueba creado exitosamente');
            // Recargar dashboard
            cargarEstadisticas();
            cargarBonos();
            cargarUltimosBonos();
        } else {
            alert('❌ Error creando bono de prueba: ' + data.error);
        }
    } catch (error) {
        console.error('Error creando bono de prueba:', error);
        alert('❌ Error creando bono de prueba');
    }
}