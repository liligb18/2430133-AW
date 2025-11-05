/* === SCRIPT MÓDULO DE AGENDA === */
document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const AGENDA_KEY = 'agenda_db';
    const PACIENTES_KEY = 'pacientes_db';
    const MEDICOS_KEY = 'medicos_db';
    const formContainer = document.getElementById('form-container-cita');
    const citaForm = document.getElementById('form-cita');
    const citaIdInput = document.getElementById('cita-id');
    const pacienteSelect = document.getElementById('paciente-cita');
    const medicoSelect = document.getElementById('medico-cita');
    const fechaInput = document.getElementById('fecha-cita');
    const estatusSelect = document.getElementById('estatus-cita');
    const motivoInput = document.getElementById('motivo-cita');
    const btnNuevaCita = document.getElementById('btn-nueva-cita');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaCitasBody = document.getElementById('tabla-citas-body');
    const searchBar = document.getElementById('search-bar');
    const getCitas = () => JSON.parse(localStorage.getItem(AGENDA_KEY) || '[]');
    const saveCitas = (data) => localStorage.setItem(AGENDA_KEY, JSON.stringify(data));
    const getPacientes = () => JSON.parse(localStorage.getItem(PACIENTES_KEY) || '[]');
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');

    const cargarSelects = () => {
        const pacientes = getPacientes();
        pacienteSelect.innerHTML = '<option value="">Seleccione un paciente...</option>';
        pacientes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id; 
            option.textContent = p.nombre;
            pacienteSelect.appendChild(option);
        });
        const medicos = getMedicos();
        medicoSelect.innerHTML = '<option value="">Seleccione un médico...</option>';
        medicos.forEach(m => {
            const option = document.createElement('option');
            option.value = m.id;
            option.textContent = `${m.nombre} (${m.especialidad})`;
            medicoSelect.appendChild(option);
        });
    };
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };
    const renderizarTabla = (filtro = '') => {
        let citas = getCitas();
        const pacientes = getPacientes();
        const medicos = getMedicos();
        const filtroLower = filtro.toLowerCase();
        if (userRole === 'Medico') {
            const medicoIdLogueado = localStorage.getItem('medicoId');
            citas = citas.filter(c => c.medicoId === medicoIdLogueado);
        }
        let citasEnriquecidas = citas.map(cita => {
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const medico = medicos.find(m => m.id === cita.medicoId);
            return {
                ...cita,
                nombrePaciente: paciente ? paciente.nombre : '',
                nombreMedico: medico ? medico.nombre : ''
            };
        });
        if (filtroLower) {
            citasEnriquecidas = citasEnriquecidas.filter(c => 
                c.nombrePaciente.toLowerCase().includes(filtroLower) ||
                c.nombreMedico.toLowerCase().includes(filtroLower)
            );
        }
        tablaCitasBody.innerHTML = '';
        if (citasEnriquecidas.length === 0) {
            tablaCitasBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay citas ${filtro ? 'que coincidan' : 'programadas'}.</td></tr>`;
            return;
        }
        citasEnriquecidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        citasEnriquecidas.forEach(cita => {
            const estatusPago = cita.pagoEstatus || 'Pendiente';
            const clasePago = estatusPago === 'Pagado' ? 'status-pagado' : 'status-pendiente';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${cita.nombrePaciente || 'N/A'}</td>
                <td>${cita.nombreMedico || 'N/A'}</td>
                <td><span class="status status-${cita.estatus.toLowerCase()}">${cita.estatus}</span></td>
                <td><span class="status ${clasePago}">${estatusPago}</span></td>
                <td class="actions-cell">
                    ${userRole === 'Medico' ? 
                    `<button class="btn btn-primary btn-atender-cita" data-cita-id="${cita.id}" data-paciente-id="${cita.pacienteId}">
                        <i class="fas fa-stethoscope"></i> ${cita.estatus === 'Realizada' ? 'Ver Exp.' : 'Atender'}
                    </button>` : ''
                    }
                    ${userRole !== 'Medico' ? 
                    `<button class="btn btn-edit btn-editar-cita" data-id="${cita.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-cita" data-id="${cita.id}" data-paciente-nombre="${cita.nombrePaciente}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>` : ''
                    }
                </td>
            `;
            tablaCitasBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-cita').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-cita').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
        document.querySelectorAll('.btn-atender-cita').forEach(btn => {
            btn.addEventListener('click', handleAtender);
        });
    };
    const handleAtender = (event) => {
        const citaId = event.currentTarget.dataset.citaId;
        const pacienteId = event.currentTarget.dataset.pacienteId;
        window.location.href = `consulta.html?citaId=${citaId}&pacienteId=${pacienteId}`;
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const id = citaIdInput.value;
        const [pacienteId, medicoId] = [pacienteSelect.value, medicoSelect.value];
        const citaData = {
            id: id || `cita_id_${Date.now()}`,
            pacienteId: pacienteId, 
            medicoId: medicoId,
            fecha: fechaInput.value,
            estatus: estatusSelect.value,
            motivo: motivoInput.value,
            pagoEstatus: id ? getCitas().find(c=>c.id === id).pagoEstatus : 'Pendiente',
            montoPagado: id ? getCitas().find(c=>c.id === id).montoPagado : null,
            tarifaId: id ? getCitas().find(c=>c.id === id).tarifaId : null
        };
        const citas = getCitas();
        let accionBitacora = 'Actualización';
        if (id) {
            const index = citas.findIndex(c => c.id === id);
            if (index !== -1) citas[index] = citaData;
        } else {
            accionBitacora = 'Creación';
            citas.push(citaData);
        }
        saveCitas(citas);
        // --- ¡BITÁCORA! ---
        const nombrePaciente = getPacientes().find(p => p.id === pacienteId)?.nombre || 'N/A';
        window.registrarBitacora('Agenda', accionBitacora, `Se guardó cita para '${nombrePaciente}' (ID: ${citaData.id}).`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const cita = getCitas().find(c => c.id === id);
        if (!cita) return;
        citaIdInput.value = cita.id;
        pacienteSelect.value = cita.pacienteId;
        medicoSelect.value = cita.medicoId;
        fechaInput.value = cita.fecha;
        estatusSelect.value = cita.estatus;
        motivoInput.value = cita.motivo;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const nombrePaciente = event.currentTarget.dataset.pacienteNombre;
        if (!confirm('¿Estás seguro de eliminar esta cita?')) return;
        let citas = getCitas();
        citas = citas.filter(c => c.id !== id);
        saveCitas(citas);
        // --- ¡BITÁCORA! ---
        window.registrarBitacora('Agenda', 'Eliminación', `Se eliminó la cita de '${nombrePaciente}' (ID: ${id}).`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
    };
    const mostrarFormulario = () => {
        cargarSelects(); 
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        citaForm.reset();
        citaIdInput.value = '';
    };
    citaForm.addEventListener('submit', handleFormSubmit);
    btnNuevaCita.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    searchBar.addEventListener('keyup', (event) => {
        renderizarTabla(event.target.value);
    });
    if (userRole === 'Medico') {
        btnNuevaCita.style.display = 'none';
    }
    renderizarTabla();
});