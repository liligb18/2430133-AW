document.addEventListener('DOMContentLoaded', () => {

    // --- Bloque de Seguridad ---
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    // --- Llaves de Local Storage ---
    const AGENDA_KEY = 'agenda_db';
    const PACIENTES_KEY = 'pacientes_db';
    const MEDICOS_KEY = 'medicos_db';

    // --- Referencias al DOM ---
    const totalRecaudadoEl = document.getElementById('reporte-total-recaudado');
    const consultasPagadasEl = document.getElementById('reporte-consultas-pagadas');
    const pagosPendientesEl = document.getElementById('reporte-pagos-pendientes');
    const medicoSelect = document.getElementById('medico-reporte-select');
    const btnGenerar = document.getElementById('btn-generar-reporte');
    const btnImprimir = document.getElementById('btn-imprimir-reporte');
    const cardReporte = document.getElementById('card-reporte-medico');
    const tablaReporteBody = document.querySelector('#tabla-reporte-medico tbody');
    const tituloReporte = document.getElementById('titulo-reporte-medico');

    // --- Funciones ---
    const getCitas = () => JSON.parse(localStorage.getItem(AGENDA_KEY) || '[]');
    const getPacientes = () => JSON.parse(localStorage.getItem(PACIENTES_KEY) || '[]');
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };


    /**
     * Reporte 1: Carga el resumen financiero
     */
    const cargarResumenFinanciero = () => {
        const citas = getCitas();
        let totalRecaudado = 0;
        let consultasPagadas = 0;
        let pagosPendientes = 0;

        // Iteramos solo sobre citas que no estén canceladas
        citas.filter(c => c.estatus !== 'Cancelada').forEach(cita => {
            if (cita.pagoEstatus === 'Pagado' && cita.montoPagado) {
                totalRecaudado += parseFloat(cita.montoPagado);
                consultasPagadas++;
            } else {
                // Contamos como pendiente si está realizada pero no pagada
                if(cita.estatus === 'Realizada') {
                    pagosPendientes++;
                }
            }
        });

        totalRecaudadoEl.textContent = `$${totalRecaudado.toFixed(2)}`;
        consultasPagadasEl.textContent = consultasPagadas;
        pagosPendientesEl.textContent = pagosPendientes;
    };

    /**
     * Carga el select de médicos para el reporte 2
     */
    const cargarSelectMedicos = () => {
        const medicos = getMedicos();
        medicoSelect.innerHTML = '<option value="">Todos los Médicos</option>';
        medicos.forEach(m => {
            const option = document.createElement('option');
            option.value = m.id;
            option.textContent = m.nombre;
            medicoSelect.appendChild(option);
        });
    };

    /**
     * Reporte 2: Genera la tabla de citas por médico
     */
    const generarReporteMedico = () => {
        const medicoId = medicoSelect.value;
        const medicos = getMedicos();
        const pacientes = getPacientes();
        let citas = getCitas();

        let nombreMedico = "Todos los Médicos";
        // Si se seleccionó un médico, filtra
        if (medicoId) {
            citas = citas.filter(c => c.medicoId === medicoId);
            nombreMedico = medicos.find(m => m.id === medicoId)?.nombre || 'N/A';
        }

        tituloReporte.textContent = `Reporte de Citas para: ${nombreMedico}`;
        tablaReporteBody.innerHTML = '';

        if (citas.length === 0) {
            tablaReporteBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No se encontraron citas.</td></tr>';
            cardReporte.style.display = 'block';
            return;
        }

        citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Orden cronológico

        citas.forEach(cita => {
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const estatusPago = cita.pagoEstatus || 'Pendiente';
            const montoPagado = cita.montoPagado ? `$${parseFloat(cita.montoPagado).toFixed(2)}` : 'N/A';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${paciente ? paciente.nombre : 'N/A'}</td>
                <td><span class="status status-${cita.estatus.toLowerCase()}">${cita.estatus}</span></td>
                <td><span class="status ${estatusPago === 'Pagado' ? 'status-pagado' : 'status-pendiente'}">${estatusPago}</span></td>
                <td>${montoPagado}</td>
            `;
            tablaReporteBody.appendChild(tr);
        });

        cardReporte.style.display = 'block';
        
       
        window.registrarBitacora('Reportes', 'Generación', `Se generó reporte de citas para '${nombreMedico}'.`);
       
    };

    // --- Eventos ---
    btnGenerar.addEventListener('click', generarReporteMedico);
    btnImprimir.addEventListener('click', () => {
        // Solo imprime si el reporte es visible
        if (cardReporte.style.display === 'block') {
            window.print();
        } else {
            alert('Primero debe generar un reporte para poder imprimirlo.');
        }
    });

    // --- Carga Inicial ---
    cargarResumenFinanciero();
    cargarSelectMedicos();
});