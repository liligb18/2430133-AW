document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const PACIENTES_KEY = 'pacientes_db';
    const AGENDA_KEY = 'agenda_db';
    const EXPEDIENTES_KEY = 'expedientes_db';
    const MEDICOS_KEY = 'medicos_db';
    const headerInfo = document.getElementById('info-paciente-header');
    const datosFijosDiv = document.getElementById('datos-paciente-fijos');
    const historialDiv = document.getElementById('historial-consultas');
    const infoCitaFecha = document.getElementById('info-cita-fecha');
    const motivoTextarea = document.getElementById('motivo-consulta');
    const diagnosticoTextarea = document.getElementById('diagnostico');
    const tratamientoTextarea = document.getElementById('tratamiento');
    const notasTextarea = document.getElementById('notas-medicas');
    const consultaForm = document.getElementById('form-consulta');
    const btnVolver = document.getElementById('btn-volver-agenda');
    let citaId = null;
    let pacienteId = null;
    let medicoId = null;
    const getPacientes = () => JSON.parse(localStorage.getItem(PACIENTES_KEY) || '[]');
    const getCitas = () => JSON.parse(localStorage.getItem(AGENDA_KEY) || '[]');
    const saveCitas = (data) => localStorage.setItem(AGENDA_KEY, JSON.stringify(data));
    const getExpedientes = () => JSON.parse(localStorage.getItem(EXPEDIENTES_KEY) || '[]');
    const saveExpedientes = (data) => localStorage.setItem(EXPEDIENTES_KEY, JSON.stringify(data));
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };
    const cargarDatosPaciente = (paciente) => {
        if (!paciente) {
            headerInfo.textContent = "Error: Paciente no encontrado";
            return;
        }
        headerInfo.textContent = `Paciente: ${paciente.nombre} (CURP: ${paciente.curp || 'N/A'})`;
        datosFijosDiv.innerHTML = `
            <p><strong>Teléfono:</strong> ${paciente.telefono || 'N/A'}</p>
            <p><strong>Correo:</strong> ${paciente.email || 'N/A'}</p>
            <p><strong>Alergias:</strong> <span class="alergias">${paciente.alergias || 'Ninguna registrada'}</span></p>
            <p><strong>Antecedentes:</strong> ${paciente.antecedentes || 'Ninguno registrado'}</p>
        `;
    };
    const cargarHistorial = (pacienteId) => {
        const expedientes = getExpedientes();
        const medicos = getMedicos();
        const historialPaciente = expedientes
            .filter(e => e.pacienteId === pacienteId)
            .sort((a, b) => new Date(b.fechaConsulta) - new Date(a.fechaConsulta));
        historialDiv.innerHTML = '';
        if (historialPaciente.length === 0) {
            historialDiv.innerHTML = '<p>No hay consultas previas registradas.</p>';
            return;
        }
        historialPaciente.forEach(exp => {
            const medico = medicos.find(m => m.id === exp.medicoId);
            const nombreMedico = medico ? medico.nombre : 'Dr. Desconocido';
            const item = document.createElement('div');
            item.className = 'historial-item';
            item.innerHTML = `
                <strong>${formatearFecha(exp.fechaConsulta)}</strong> (Atendió: ${nombreMedico})
                <p><strong>Dx:</strong> ${exp.diagnostico}</p>
            `;
            historialDiv.appendChild(item);
        });
    };
    const cargarDatosCita = (cita) => {
        if (!cita) return;
        infoCitaFecha.textContent = formatearFecha(cita.fecha);
        motivoTextarea.value = cita.motivo || 'No se especificó motivo.';
        medicoId = cita.medicoId;
    };
    
    const handleFormSubmit = (event) => {
        event.preventDefault();
        try {
            // --- INICIO VALIDACIONES ---
            const diagnostico = Validaciones.validarCampoTexto(diagnosticoTextarea.value, 'Diagnóstico');
            const tratamiento = Validaciones.validarCampoTexto(tratamientoTextarea.value, 'Tratamiento');
           
            const nuevoExpediente = {
                id: `exp_${Date.now()}`,
                citaId: citaId,
                pacienteId: pacienteId,
                medicoId: medicoId,
                fechaConsulta: new Date().toISOString(),
                diagnostico: diagnostico,
                tratamiento: tratamiento,
                notas: notasTextarea.value.trim()
            };
            
            const expedientes = getExpedientes();
            expedientes.push(nuevoExpediente);
            saveExpedientes(expedientes);
            
            const citas = getCitas();
            const indexCita = citas.findIndex(c => c.id === citaId);
            if (indexCita !== -1) {
                citas[indexCita].estatus = 'Realizada';
                saveCitas(citas);
            }
            
            const nombrePaciente = getPacientes().find(p => p.id === pacienteId)?.nombre || 'N/A';
            window.registrarBitacora('Consulta', 'Registro', `Se guardó expediente para '${nombrePaciente}' (Cita ID: ${citaId}).`);
            
            alert('Consulta guardada exitosamente.');
            window.location.href = 'agenda.html';
        
        } catch (error) {
            console.warn(error.message);
        }
    };

    const init = () => {
        const params = new URLSearchParams(window.location.search);
        citaId = params.get('citaId');
        pacienteId = params.get('pacienteId');
        if (!citaId || !pacienteId) {
            alert('Error: No se especificó una cita o paciente.');
            window.location.href = 'agenda.html';
            return;
        }
        const paciente = getPacientes().find(p => p.id === pacienteId);
        const cita = getCitas().find(c => c.id === citaId);
        cargarDatosPaciente(paciente);
        cargarHistorial(pacienteId);
        cargarDatosCita(cita);
        
        if (cita && cita.estatus === 'Realizada') {
            const expediente = getExpedientes().find(e => e.citaId === citaId);
            if (expediente) {
                diagnosticoTextarea.value = expediente.diagnostico;
                tratamientoTextarea.value = expediente.tratamiento;
                notasTextarea.value = expediente.notas;
            } else {
                diagnosticoTextarea.value = "Esta consulta fue marcada como 'Realizada' pero no se encontró expediente.";
            }
            diagnosticoTextarea.disabled = true;
            tratamientoTextarea.disabled = true;
            notasTextarea.disabled = true;
            document.querySelector('#form-consulta button[type="submit"]').disabled = true;
            document.querySelector('#form-consulta button[type="submit"]').textContent = 'Consulta Finalizada';
        }
    };
    
    consultaForm.addEventListener('submit', handleFormSubmit);
    btnVolver.addEventListener('click', () => {
        window.location.href = 'agenda.html';
    });
    
    init();
});