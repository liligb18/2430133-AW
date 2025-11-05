/* === SCRIPT MÓDULO DE PACIENTES === */
document.addEventListener('DOMContentLoaded', () => {

    // --- ¡NUEVO! Bloque de Seguridad por Rol ---
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');

    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado. No tienes permisos para gestionar pacientes.');
        window.location.href = 'index.html';
        return;
    }
    // --- Fin del Bloque de Seguridad ---


    // --- 1. Definición de Constantes y Variables ---
    const PACIENTES_KEY = 'pacientes_db';
    // ... (El resto del archivo sigue igual que antes) ...
    // --- 2. Referencias a Elementos del DOM ---
    const formContainer = document.getElementById('form-container-paciente');
    const pacienteForm = document.getElementById('form-paciente');
    const pacienteIdInput = document.getElementById('paciente-id');
    const nombreInput = document.getElementById('nombre');
    const curpInput = document.getElementById('curp');
    const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
    const sexoInput = document.getElementById('sexo');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');
    const direccionInput = document.getElementById('direccion');
    const contactoEmergenciaInput = document.getElementById('contacto-emergencia');
    const telefonoEmergenciaInput = document.getElementById('telefono-emergencia');
    const alergiasInput = document.getElementById('alergias');
    const antecedentesInput = document.getElementById('antecedentes');
    const btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaPacientesBody = document.getElementById('tabla-pacientes-body');

    // --- 3. Funciones Helper (Ayudantes) para Local Storage ---
    const getPacientes = () => {
        const pacientesJSON = localStorage.getItem(PACIENTES_KEY);
        return pacientesJSON ? JSON.parse(pacientesJSON) : [];
    };
    const savePacientes = (pacientes) => {
        localStorage.setItem(PACIENTES_KEY, JSON.stringify(pacientes));
    };

    // --- 4. Funciones Principales del CRUD ---
    const renderizarTabla = () => {
        const pacientes = getPacientes();
        tablaPacientesBody.innerHTML = '';
        if (pacientes.length === 0) {
            tablaPacientesBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay pacientes registrados.</td></tr>';
            return;
        }
        pacientes.forEach(paciente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${paciente.nombre}</td>
                <td>${paciente.curp}</td>
                <td>${paciente.telefono}</td>
                <td>${paciente.email}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-paciente" data-id="${paciente.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-paciente" data-id="${paciente.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaPacientesBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-paciente').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-paciente').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const id = pacienteIdInput.value;
        const pacienteData = {
            id: id || `pac_id_${Date.now()}`, 
            nombre: nombreInput.value,
            curp: curpInput.value,
            fechaNacimiento: fechaNacimientoInput.value,
            sexo: sexoInput.value,
            telefono: telefonoInput.value,
            email: emailInput.value,
            direccion: direccionInput.value,
            contactoEmergencia: contactoEmergenciaInput.value,
            telefonoEmergencia: telefonoEmergenciaInput.value,
            alergias: alergiasInput.value,
            antecedentes: antecedentesInput.value
        };
        const pacientes = getPacientes();
        if (id) {
            const index = pacientes.findIndex(p => p.id === id);
            if (index !== -1) {
                pacientes[index] = pacienteData;
            }
        } else {
            pacientes.push(pacienteData);
        }
        savePacientes(pacientes);
        renderizarTabla();
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const pacientes = getPacientes();
        const paciente = pacientes.find(p => p.id === id);
        if (!paciente) {
            alert('Error: No se encontró el paciente.');
            return;
        }
        pacienteIdInput.value = paciente.id;
        nombreInput.value = paciente.nombre;
        curpInput.value = paciente.curp;
        fechaNacimientoInput.value = paciente.fechaNacimiento;
        sexoInput.value = paciente.sexo;
        telefonoInput.value = paciente.telefono;
        emailInput.value = paciente.email;
        direccionInput.value = paciente.direccion;
        contactoEmergenciaInput.value = paciente.contactoEmergencia;
        telefonoEmergenciaInput.value = paciente.telefonoEmergencia;
        alergiasInput.value = paciente.alergias;
        antecedentesInput.value = paciente.antecedentes;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        if (!confirm('¿Estás seguro de que deseas eliminar a este paciente?')) {
            return; 
        }
        let pacientes = getPacientes();
        pacientes = pacientes.filter(p => p.id !== id);
        savePacientes(pacientes);
        renderizarTabla();
    };
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
        window.scrollTo(0, 0); 
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        pacienteForm.reset(); 
        pacienteIdInput.value = ''; 
    };

    // --- 5. Asignación de Eventos Iniciales ---
    pacienteForm.addEventListener('submit', handleFormSubmit);
    btnNuevoPaciente.addEventListener('click', () => {
        ocultarFormulario(); 
        mostrarFormulario();
    });
    btnCancelar.addEventListener('click', ocultarFormulario);

    // --- 6. Carga Inicial de Datos ---
    renderizarTabla();
});