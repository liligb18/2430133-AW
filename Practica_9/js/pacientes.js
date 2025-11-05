/* === SCRIPT MÓDULO DE PACIENTES === */
document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const PACIENTES_KEY = 'pacientes_db';
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
    const searchBar = document.getElementById('search-bar');
    const getPacientes = () => JSON.parse(localStorage.getItem(PACIENTES_KEY) || '[]');
    const savePacientes = (data) => localStorage.setItem(PACIENTES_KEY, JSON.stringify(data));

    const renderizarTabla = (filtro = '') => {
        let pacientes = getPacientes();
        const filtroLower = filtro.toLowerCase();
        if (filtroLower) {
            pacientes = pacientes.filter(p => 
                p.nombre.toLowerCase().includes(filtroLower) ||
                (p.curp && p.curp.toLowerCase().includes(filtroLower)) ||
                (p.telefono && p.telefono.toLowerCase().includes(filtroLower))
            );
        }
        tablaPacientesBody.innerHTML = '';
        if (pacientes.length === 0) {
            tablaPacientesBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay pacientes ${filtro ? 'que coincidan' : 'registrados'}.</td></tr>`;
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
                    <button class="btn btn-danger btn-eliminar-paciente" data-id="${paciente.id}" data-nombre="${paciente.nombre}">
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
            if (userRole === 'Admin' || userRole === 'Recepcionista') {
                btn.addEventListener('click', handleEliminar);
            } else {
                btn.style.display = 'none';
            }
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
        let accionBitacora = 'Actualización';
        if (id) {
            const index = pacientes.findIndex(p => p.id === id);
            if (index !== -1) pacientes[index] = pacienteData;
        } else {
            accionBitacora = 'Creación';
            pacientes.push(pacienteData);
        }
        savePacientes(pacientes);
        // --- ¡BITÁCORA! ---
        window.registrarBitacora('Pacientes', accionBitacora, `Se guardó al paciente '${pacienteData.nombre}' (ID: ${pacienteData.id}).`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const paciente = getPacientes().find(p => p.id === id);
        if (!paciente) return;
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
        const esMedico = userRole === 'Medico';
        nombreInput.disabled = esMedico;
        curpInput.disabled = esMedico;
        fechaNacimientoInput.disabled = esMedico;
        sexoInput.disabled = esMedico;
        telefonoInput.disabled = esMedico;
        emailInput.disabled = esMedico;
        direccionInput.disabled = esMedico;
        contactoEmergenciaInput.disabled = esMedico;
        telefonoEmergenciaInput.disabled = esMedico;
        alergiasInput.disabled = false;
        antecedentesInput.disabled = false;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar a este paciente?')) return;
        let pacientes = getPacientes();
        pacientes = pacientes.filter(p => p.id !== id);
        savePacientes(pacientes);
        // --- ¡BITÁCORA! ---
        window.registrarBitacora('Pacientes', 'Eliminación', `Se eliminó al paciente '${nombre}' (ID: ${id}).`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
    };
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        pacienteForm.reset(); 
        pacienteIdInput.value = '';
        document.querySelectorAll('#form-paciente input, #form-paciente select, #form-paciente textarea').forEach(el => el.disabled = false);
    };
    pacienteForm.addEventListener('submit', handleFormSubmit);
    btnNuevoPaciente.addEventListener('click', () => {
        ocultarFormulario();
        mostrarFormulario();
    });
    btnCancelar.addEventListener('click', ocultarFormulario);
    searchBar.addEventListener('keyup', (event) => {
        renderizarTabla(event.target.value);
    });
    if (userRole === 'Medico') {
        btnNuevoPaciente.style.display = 'none';
    }
    renderizarTabla();
});