
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Llaves de Local Storage ---
    const AGENDA_KEY = 'agenda_db';
    const PACIENTES_KEY = 'pacientes_db';
    const MEDICOS_KEY = 'medicos_db';

    // --- 2. Referencias al DOM ---
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

    
    // --- 3. Funciones ---
    
    const getCitas = () => {
        const data = localStorage.getItem(AGENDA_KEY);
        return data ? JSON.parse(data) : [];
    };
    const saveCitas = (data) => {
        localStorage.setItem(AGENDA_KEY, JSON.stringify(data));
    };

    // Funciones para leer los datos de otros módulos
    const getPacientes = () => {
        const data = localStorage.getItem(PACIENTES_KEY);
        return data ? JSON.parse(data) : [];
    };
    const getMedicos = () => {
        const data = localStorage.getItem(MEDICOS_KEY);
        return data ? JSON.parse(data) : [];
    };

    
    // --- 4. Funciones Principales ---

    const cargarSelects = () => {
        // --- Cargar Pacientes ---
        const pacientes = getPacientes();
        pacienteSelect.innerHTML = '<option value="">Seleccione un paciente...</option>'; // Limpiar
        if (pacientes.length === 0) {
            pacienteSelect.innerHTML = '<option value="">No hay pacientes registrados</option>';
        }
        pacientes.forEach(p => {
            const option = document.createElement('option');
            // Guardamos el ID del paciente, pero mostramos su nombre
            option.value = p.id; 
            option.textContent = p.nombre;
            pacienteSelect.appendChild(option);
        });

        // --- Cargar Médicos ---
        const medicos = getMedicos();
        medicoSelect.innerHTML = '<option value="">Seleccione un médico...</option>'; // Limpiar
        if (medicos.length === 0) {
            medicoSelect.innerHTML = '<option value="">No hay médicos registrados</option>';
        }
        medicos.forEach(m => {
            const option = document.createElement('option');
            // Guardamos el ID del médico, pero mostramos su nombre
            option.value = m.id;
            option.textContent = `${m.nombre} (${m.especialidad})`; // Mostramos nombre y especialidad
            medicoSelect.appendChild(option);
        });
    };
    
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { 
                day: '2-digit', month: 'short', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: true 
            };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) {
            return fechaString; // Si falla, devuelve el original
        }
    };

   
    const renderizarTabla = () => {
        const citas = getCitas();
        const pacientes = getPacientes();
        const medicos = getMedicos();
        
        tablaCitasBody.innerHTML = '';

        if (citas.length === 0) {
            tablaCitasBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay citas programadas.</td></tr>';
            return;
        }

        // Ordenamos las citas por fecha
        citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        citas.forEach(cita => {
            // Buscamos el nombre del paciente y médico usando los IDs guardados
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const medico = medicos.find(m => m.id === cita.medicoId);

            const nombrePaciente = paciente ? paciente.nombre : 'Paciente Eliminado';
            const nombreMedico = medico ? medico.nombre : 'Médico Eliminado';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${nombrePaciente}</td>
                <td>${nombreMedico}</td>
                <td>${cita.motivo || ''}</td>
                <td>${cita.estatus}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-cita" data-id="${cita.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-cita" data-id="${cita.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
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
    };

  
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const id = citaIdInput.value;
        const citaData = {
            id: id || `cita_id_${Date.now()}`,
            // Guardamos los IDs de los <select>
            pacienteId: pacienteSelect.value, 
            medicoId: medicoSelect.value,
            fecha: fechaInput.value,
            estatus: estatusSelect.value,
            motivo: motivoInput.value
        };

        const citas = getCitas();

        if (id) {
            // Actualizar
            const index = citas.findIndex(c => c.id === id);
            if (index !== -1) {
                citas[index] = citaData;
            }
        } else {
            // Crear
            citas.push(citaData);
        }

        saveCitas(citas);
        renderizarTabla();
        ocultarFormulario();
    };

    
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const citas = getCitas();
        const cita = citas.find(c => c.id === id);

        if (!cita) return;

        // Rellenamos el formulario
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
        
        if (!confirm('¿Estás seguro de eliminar esta cita?')) {
            return;
        }

        let citas = getCitas();
        citas = citas.filter(c => c.id !== id);
        saveCitas(citas);
        renderizarTabla();
    };

    // --- Funciones  ---
    const mostrarFormulario = () => {
        // Recarga los selects CADA VEZ que se abre el formulario,
        // por si se añadió un nuevo paciente o médico.
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

    cargarSelects();
    renderizarTabla();
});