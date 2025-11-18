document.addEventListener('DOMContentLoaded', () => {

    // --- Bloque de Seguridad ---
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    // --- Endpoints API ---
    const API_MEDICOS = 'php/api/medicos.php';
    const API_ESPECIALIDADES = 'php/api/especialidades.php';

    // --- Referencias al DOM ---
    const formContainer = document.getElementById('form-container-medico');
    const medicoForm = document.getElementById('form-medico');
    const medicoIdInput = document.getElementById('medico-id');
    const nombreInput = document.getElementById('nombre-medico');
    const cedulaInput = document.getElementById('cedula');
    const especialidadSelect = document.getElementById('especialidad');
    const telefonoInput = document.getElementById('telefono-medico');
    const emailInput = document.getElementById('email-medico');
    
    // --- Referencias Horario ---
    const diasSemanaInputs = document.getElementById('dias-semana-inputs');
    const horaEntradaInput = document.getElementById('hora-entrada');
    const horaSalidaInput = document.getElementById('hora-salida');

    const btnNuevoMedico = document.getElementById('btn-nuevo-medico');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaMedicosBody = document.getElementById('tabla-medicos-body');
    const searchBar = document.getElementById('search-bar');
    
    // --- Funciones para llamar a la API ---
    const postForm = (url, data) => fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: new URLSearchParams(data)
    }).then(res => res.json());

    const apiListMedicos = () => fetch(API_MEDICOS).then(r => r.json());
    const apiCreateMedico = (payload) => postForm(API_MEDICOS, Object.assign({ action: 'create' }, payload));
    const apiUpdateMedico = (payload) => postForm(API_MEDICOS, Object.assign({ action: 'update' }, payload));
    const apiDeleteMedico = (id) => postForm(API_MEDICOS, { action: 'delete', id });

    const apiListEspecialidades = () => fetch(API_ESPECIALIDADES).then(r => r.json());

    
    // --- Funciones del CRUD ---

    const cargarEspecialidades = async () => {
        especialidadSelect.innerHTML = '<option value="">Cargando...</option>';
        try {
            const res = await apiListEspecialidades();
            especialidadSelect.innerHTML = '<option value="">Seleccione...</option>';
            if (!res.success || !res.data || res.data.length === 0) {
                especialidadSelect.innerHTML = '<option value="">No hay especialidades</option>';
                return;
            }
            res.data.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.nombre;
                option.textContent = esp.nombre;
                especialidadSelect.appendChild(option);
            });
        } catch (e) {
            especialidadSelect.innerHTML = '<option value="">Error al cargar</option>';
            console.error(e);
        }
    };

    const renderizarTabla = async (filtro = '') => {
        tablaMedicosBody.innerHTML = '<tr><td colspan="5" style="text-align:center">Cargando...</td></tr>';
        try {
            const res = await apiListMedicos();
            if (!res.success) throw new Error(res.message || 'Error API');
            let medicos = res.data || [];
            const filtroLower = filtro.toLowerCase();
            if (filtroLower) {
                medicos = medicos.filter(m =>
                    (m.nombre || '').toLowerCase().includes(filtroLower) ||
                    (m.cedula || '').toLowerCase().includes(filtroLower) ||
                    (m.especialidad || '').toLowerCase().includes(filtroLower)
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
                    <td>${medico.especialidad || ''}</td>
                    <td>${medico.telefono || ''}</td>
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
        } catch (e) {
            tablaMedicosBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">Error al cargar médicos</td></tr>`;
            console.error(e);
        }
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-medico').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-medico').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            // --- INICIO VALIDACIONES ---
            const id = medicoIdInput.value;
            const nombre = Validaciones.validarCampoTexto(nombreInput.value, 'Nombre Completo');
            const cedula = Validaciones.validarCampoTexto(cedulaInput.value, 'Cédula Profesional');
            const especialidad = Validaciones.validarCampoTexto(especialidadSelect.value, 'Especialidad');
            const telefono = Validaciones.validarTelefono(telefonoInput.value);
            const email = Validaciones.validarEmail(emailInput.value);

            // Validar Horario
            const horaEntrada = horaEntradaInput.value;
            const horaSalida = horaSalidaInput.value;
            Validaciones.validarHorario(horaEntrada, horaSalida);
            
            // Validar Días
            const diasSeleccionados = [];
            diasSemanaInputs.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                diasSeleccionados.push(checkbox.value);
            });
            if (diasSeleccionados.length === 0) {
                Validaciones.mostrarError('Debe seleccionar al menos un día de trabajo.');
            }
            // --- FIN VALIDACIONES ---

            const medicoData = {
                nombre,
                cedula,
                especialidad,
                telefono,
                email,
                horario: JSON.stringify({ dias: diasSeleccionados, entrada: horaEntrada, salida: horaSalida })
            };
            let res;
            if (id) {
                medicoData.id = id;
                res = await apiUpdateMedico(medicoData);
            } else {
                res = await apiCreateMedico(medicoData);
            }
            if (!res || !res.success) throw new Error(res.message || 'Error al guardar');
            window.registrarBitacora('Médicos', id ? 'Actualización' : 'Creación', `Se guardó al médico '${nombre}'.`);
            await renderizarTabla(searchBar.value);
            ocultarFormulario();

        } catch (error) {
            console.warn(error.message);
        }
    };

    const handleEditar = (event) => {
        (async () => {
            const id = event.currentTarget.dataset.id;
            try {
                const res = await apiListMedicos();
                if (!res.success) throw new Error(res.message || 'Error');
                const medico = (res.data || []).find(m => String(m.id) === String(id));
                if (!medico) return;
                medicoIdInput.value = medico.id;
                nombreInput.value = medico.nombre || '';
                cedulaInput.value = medico.cedula || '';
                especialidadSelect.value = medico.especialidad || '';
                telefonoInput.value = medico.telefono || '';
                emailInput.value = medico.email || '';
                diasSemanaInputs.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { checkbox.checked = false; });
                if (medico.horario && medico.horario.dias) {
                    medico.horario.dias.forEach(dia => {
                        const checkbox = document.getElementById(`dia-${dia}`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                horaEntradaInput.value = medico.horario ? (medico.horario.entrada || '') : '';
                horaSalidaInput.value = medico.horario ? (medico.horario.salida || '') : '';
                mostrarFormulario();
            } catch (e) { console.error(e); }
        })();
    };

    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar a este médico?')) return;
        (async () => {
            try {
                const res = await apiDeleteMedico(id);
                if (!res.success) throw new Error(res.message || 'Error al eliminar');
                window.registrarBitacora('Médicos', 'Eliminación', `Se eliminó al médico '${nombre}' (ID: ${id}).`);
                await renderizarTabla(searchBar.value);
            } catch (e) { console.error(e); alert('Error al eliminar'); }
        })();
    };

    const mostrarFormulario = () => {
        cargarEspecialidades();
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        medicoForm.reset();
        medicoIdInput.value = '';
        // Limpiamos los checkboxes manualmente
         diasSemanaInputs.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    };

    // --- Eventos Iniciales ---
    medicoForm.addEventListener('submit', handleFormSubmit);
    btnNuevoMedico.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    searchBar.addEventListener('keyup', (event) => {
        renderizarTabla(event.target.value);
    });

    // --- Carga Inicial ---
    cargarEspecialidades();
    renderizarTabla();
});