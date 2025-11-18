document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Recepcionista'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const AGENDA_KEY = 'agenda_db';
    const PACIENTES_KEY = 'pacientes_db';
    const MEDICOS_KEY = 'medicos_db';
    const TARIFAS_KEY = 'tarifas_db';
    const formContainer = document.getElementById('form-container-pago');
    const pagoForm = document.getElementById('form-pago');
    const citaIdInput = document.getElementById('pago-cita-id');
    const pacienteNombreSpan = document.getElementById('pago-paciente-nombre');
    const citaFechaSpan = document.getElementById('pago-cita-fecha');
    const tarifaSelect = document.getElementById('tarifa-select');
    const montoInput = document.getElementById('monto-pago');
    const btnCancelarPago = document.getElementById('btn-cancelar-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos-body');
    const getCitas = () => JSON.parse(localStorage.getItem(AGENDA_KEY) || '[]');
    const saveCitas = (data) => localStorage.setItem(AGENDA_KEY, JSON.stringify(data));
    const getPacientes = () => JSON.parse(localStorage.getItem(PACIENTES_KEY) || '[]');
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');
    const getTarifas = () => JSON.parse(localStorage.getItem(TARIFAS_KEY) || '[]');

    const cargarTarifasSelect = () => {
        const tarifas = getTarifas();
        tarifaSelect.innerHTML = '<option value="">Seleccione un servicio...</option>';
        tarifas.forEach(t => {
            const option = document.createElement('option');
            option.value = `${t.id}|${t.costo}`;
            option.textContent = `${t.nombre} ($${t.costo})`;
            tarifaSelect.appendChild(option);
        });
    };
    tarifaSelect.addEventListener('change', () => {
        const [tarifaId, costo] = tarifaSelect.value.split('|');
        if (costo) {
            montoInput.value = costo;
        } else {
            montoInput.value = "";
        }
    });
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };
    const renderizarTabla = () => {
        const citas = getCitas();
        const pacientes = getPacientes();
        const medicos = getMedicos();
        tablaPagosBody.innerHTML = '';
        const citasFiltradas = citas.filter(c => c.estatus !== 'Programada').sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        if (citasFiltradas.length === 0) {
            tablaPagosBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay citas realizadas o confirmadas.</td></tr>';
            return;
        }
        citasFiltradas.forEach(cita => {
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const medico = medicos.find(m => m.id === cita.medicoId);
            const estatusPago = cita.pagoEstatus || 'Pendiente';
            const montoPagado = cita.montoPagado ? `$${parseFloat(cita.montoPagado).toFixed(2)}` : 'N/A';
            const clasePago = estatusPago === 'Pagado' ? 'status-pagado' : 'status-pendiente';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${paciente ? paciente.nombre : 'N/A'}</td>
                <td>${medico ? medico.nombre : 'N/A'}</td>
                <td><span class="status status-${cita.estatus.toLowerCase()}">${cita.estatus}</span></td>
                <td><span class="status ${clasePago}">${estatusPago}</span></td>
                <td>${montoPagado}</td>
                <td class="actions-cell">
                    ${estatusPago === 'Pendiente' ? 
                    `<button class="btn btn-primary btn-registrar-pago" data-id="${cita.id}">
                        <i class="fas fa-dollar-sign"></i> Registrar Pago
                    </button>` :
                    `<button class="btn btn-secondary" disabled>Pagado</button>`
                    }
                </td>
            `;
            tablaPagosBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-registrar-pago').forEach(btn => {
            btn.addEventListener('click', handleMostrarFormulario);
        });
    };
    const handleMostrarFormulario = (event) => {
        const id = event.currentTarget.dataset.id;
        const cita = getCitas().find(c => c.id === id);
        if (!cita) return;
        const paciente = getPacientes().find(p => p.id === cita.pacienteId);
        citaIdInput.value = id;
        pacienteNombreSpan.textContent = paciente ? paciente.nombre : 'No encontrado';
        citaFechaSpan.textContent = formatearFecha(cita.fecha);
        cargarTarifasSelect();
        montoInput.value = "";
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        pagoForm.reset();
        citaIdInput.value = '';
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const id = citaIdInput.value;
        const [tarifaId, costo] = tarifaSelect.value.split('|');
        const montoFinal = montoInput.value;
        if (!tarifaId || !montoFinal) {
            alert('Debe seleccionar una tarifa y un monto.');
            return;
        }
        let citas = getCitas();
        const index = citas.findIndex(c => c.id === id);
        if (index !== -1) {
            citas[index].pagoEstatus = 'Pagado';
            citas[index].montoPagado = montoFinal;
            citas[index].tarifaId = tarifaId;
            saveCitas(citas);
           
            window.registrarBitacora('Pagos', 'Registro', `Se registró pago de $${montoFinal} para la cita ID: ${id}.`);
            
            renderizarTabla();
            ocultarFormulario();
        } else {
            alert('Error: No se encontró la cita a actualizar.');
        }
    };
    pagoForm.addEventListener('submit', handleFormSubmit);
    btnCancelarPago.addEventListener('click', ocultarFormulario);
    renderizarTabla();
});