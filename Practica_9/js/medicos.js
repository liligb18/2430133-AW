/* === SCRIPT MÓDULO DE MÉDICOS === */
document.addEventListener('DOMContentLoaded', () => {

    // --- ¡NUEVO! Bloque de Seguridad por Rol ---
    const rolesPermitidos = ['Admin']; // SOLO ADMIN
    const userRole = localStorage.getItem('userRole');

    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado. No tienes permisos para gestionar médicos.');
        window.location.href = 'index.html';
        return;
    }
    // --- Fin del Bloque de Seguridad ---


    // --- 1. Llave de Local Storage ---
    const MEDICOS_KEY = 'medicos_db';
    const ESPECIALIDADES_KEY = 'especialidades_db';

    // ... (El resto del archivo sigue igual que antes) ...
    // --- 2. Referencias al DOM ---
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

    // --- 3. Funciones Helper (Ayudantes) para Local Storage ---
    const getMedicos = () => {
        const medicosJSON = localStorage.getItem(MEDICOS_KEY);
        return medicosJSON ? JSON.parse(medicosJSON) : [];
    };
    const saveMedicos = (medicos) => {
        localStorage.setItem(MEDICOS_KEY, JSON.stringify(medicos));
    };
    const getEspecialidades = () => {
        const especialidadesJSON = localStorage.getItem(ESPECIALIDADES_KEY);
        return especialidadesJSON ? JSON.parse(especialidadesJSON) : [];
    };

    // --- 4. Funciones Principales del CRUD ---
    const cargarEspecialidades = () => {
        const especialidades = getEspecialidades();
        const primeraOpcion = especialidadSelect.options[0];
        especialidadSelect.innerHTML = '';
        especialidadSelect.appendChild(primeraOpcion);
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.nombre; 
            option.textContent = esp.nombre; 
            especialidadSelect.appendChild(option);
        });
    };
    const renderizarTabla = () => {
        const medicos = getMedicos();
        tablaMedicosBody.innerHTML = '';
        if (medicos.length === 0) {
            tablaMedicosBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay médicos registrados.</td></tr>';
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
                    <button class="btn btn-danger btn-eliminar-medico" data-id="${medico.id}">
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
        if (id) {
            const index = medicos.findIndex(m => m.id === id);
            if (index !== -1) {
                medicos[index] = medicoData;
            }
        } else {
            medicos.push(medicoData);
        }
        saveMedicos(medicos);
        renderizarTabla();
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const medicos = getMedicos();
        const medico = medicos.find(m => m.id === id);
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
        if (!confirm('¿Estás seguro de que deseas eliminar a este médico?')) {
            return;
        }
        let medicos = getMedicos();
        medicos = medicos.filter(m => m.id !== id);
        saveMedicos(medicos);
        renderizarTabla();
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

    // --- 5. Asignación de Eventos Iniciales ---
    medicoForm.addEventListener('submit', handleFormSubmit);
    btnNuevoMedico.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);

    // --- 6. Carga Inicial de Datos ---
    cargarEspecialidades();
    renderizarTabla();
});