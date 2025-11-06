/* === SCRIPT MÓDULO DE MÉDICOS === */
document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const MEDICOS_KEY = 'medicos_db';
    const ESPECIALIDADES_KEY = 'especialidades_db';
    const formContainer = document.getElementById('form-container-medico');
    const medicoForm = document.getElementById('form-medico');
    const medicoIdInput = document.getElementById('medico-id');
    const nombreInput = document.getElementById('nombre-medico');
    const cedulaInput = document.getElementById('cedula');
    const especialidadSelect = document.getElementById('especialidad');
    const telefonoInput = document.getElementById('telefono-medico');
    const emailInput = document.getElementById('email-medico');
    const horarioInput = document.getElementById('horario');
    const btnNuevoMedico = document.getElementById('btn-nuevo-medico');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaMedicosBody = document.getElementById('tabla-medicos-body');
    const searchBar = document.getElementById('search-bar');
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');
    const saveMedicos = (data) => localStorage.setItem(MEDICOS_KEY, JSON.stringify(data));
    const getEspecialidades = () => JSON.parse(localStorage.getItem(ESPECIALIDADES_KEY) || '[]');

    const cargarEspecialidades = () => {
        const especialidades = getEspecialidades();
        const primeraOpcion = especialidadSelect.options[0];
        especialidadSelect.innerHTML = '';
        especialidadSelect.appendChild(primeraOpcion);
        if (especialidades.length === 0) {
             primeraOpcion.textContent = "No hay especialidades";
        } else {
             primeraOpcion.textContent = "Seleccione...";
        }
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.nombre; 
            option.textContent = esp.nombre; 
            especialidadSelect.appendChild(option);
        });
    };
    const renderizarTabla = (filtro = '') => {
        let medicos = getMedicos();
        const filtroLower = filtro.toLowerCase();
        if (filtroLower) {
            medicos = medicos.filter(m => 
                m.nombre.toLowerCase().includes(filtroLower) ||
                (m.cedula && m.cedula.toLowerCase().includes(filtroLower)) ||
                (m.especialidad && m.especialidad.toLowerCase().includes(filtroLower))
            );
        }
        tablaMedicosBody.innerHTML = '';
        if (medicos.length === 0) {
            tablaMedicosBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay médicos ${filtro ? 'que coincidan' : 'registrados'}.</td></tr>`;
            return;
        }
        medicos.forEach(medico => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${medico.nombre}</td>
                <td>${medico.cedula}</td>
                <td>${medico.especialidad}</td>
                <td>${medico.telefono}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-medico" data-id="${medico.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-medico" data-id="${medico.id}" data-nombre="${medico.nombre}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaMedicosBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-medico').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-medico').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const id = medicoIdInput.value;
        const medicoData = {
            id: id || `med_id_${Date.now()}`,
            nombre: nombreInput.value,
            cedula: cedulaInput.value,
            especialidad: especialidadSelect.value,
            telefono: telefonoInput.value,
            email: emailInput.value,
            horario: horarioInput.value
        };
        const medicos = getMedicos();
        let accionBitacora = 'Actualización';
        if (id) {
            const index = medicos.findIndex(m => m.id === id);
            if (index !== -1) medicos[index] = medicoData;
        } else {
            accionBitacora = 'Creación';
            medicos.push(medicoData);
        }
        saveMedicos(medicos);
        // --- ¡BITÁCORA! ---
        window.registrarBitacora('Médicos', accionBitacora, `Se guardó al médico '${medicoData.nombre}'.`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const medico = getMedicos().find(m => m.id === id);
        if (!medico) return;
        medicoIdInput.value = medico.id;
        nombreInput.value = medico.nombre;
        cedulaInput.value = medico.cedula;
        especialidadSelect.value = medico.especialidad;
        telefonoInput.value = medico.telefono;
        emailInput.value = medico.email;
        horarioInput.value = medico.horario;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar a este médico?')) return;
        let medicos = getMedicos();
        medicos = medicos.filter(m => m.id !== id);
        saveMedicos(medicos);
        // --- ¡BITÁCORA! ---
        window.registrarBitacora('Médicos', 'Eliminación', `Se eliminó al médico '${nombre}' (ID: ${id}).`);
        // --- Fin Bitácora ---
        renderizarTabla(searchBar.value);
    };
    const mostrarFormulario = () => {
        cargarEspecialidades(); 
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        medicoForm.reset();
        medicoIdInput.value = '';
    };
    medicoForm.addEventListener('submit', handleFormSubmit);
    btnNuevoMedico.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    searchBar.addEventListener('keyup', (event) => {
        renderizarTabla(event.target.value);
    });
    cargarEspecialidades();
    renderizarTabla();
});