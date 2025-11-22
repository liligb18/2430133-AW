document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    const API_AGENDA = 'php/api/agenda.php';
    const API_PACIENTES = 'php/api/pacientes.php';
    const API_MEDICOS = 'php/api/medicos.php';

    const formContainer = document.getElementById('form-container-cita');
    const citaForm = document.getElementById('form-cita');
    const citaIdInput = document.getElementById('cita-id');
    const pacienteSelect = document.getElementById('paciente-cita');
    const medicoSelect = document.getElementById('medico-cita');
    const fechaInput = document.getElementById('fecha-cita');
    const estatusSelect = document.getElementById('estatus-cita');
    const motivoInput = document.getElementById('motivo-cita');
    const btnNueva = document.getElementById('btn-nueva-cita');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaBody = document.getElementById('tabla-citas-body');
    const searchBar = document.getElementById('search-bar');

    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });

    const postForm = (data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(API_AGENDA, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json());
    })();

    const apiList = () => fetch(API_AGENDA, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListPacientes = () => fetch(API_PACIENTES, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListMedicos = () => fetch(API_MEDICOS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    let pacientesCache = [];
    let medicosCache = [];

    const cargarSelects = async () => {
        try {
            const [rp, rm] = await Promise.all([apiListPacientes(), apiListMedicos()]);
            pacientesCache = (rp.success && rp.data) ? rp.data : [];
            medicosCache = (rm.success && rm.data) ? rm.data : [];

            pacienteSelect.innerHTML = '<option value="">Seleccione paciente...</option>';
            medicoSelect.innerHTML = '<option value="">Seleccione médico...</option>';

            pacientesCache.forEach(p => {
                const o = document.createElement('option');
                o.value = p.id;
                o.textContent = p.nombre;
                pacienteSelect.appendChild(o);
            });

            medicosCache.forEach(m => {
                const o = document.createElement('option');
                o.value = m.id;
                o.textContent = `${m.nombre} (${m.especialidad || 'General'})`;
                medicoSelect.appendChild(o);
            });
        } catch (e) { console.error(e); }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };

    const renderizarTabla = async (filtro = '') => {
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center">Cargando...</td></tr>';
        try {
            const res = await apiList();
            let citas = (res.success && res.data) ? res.data : [];

            // Asegurar que tenemos los catálogos
            if (pacientesCache.length === 0 || medicosCache.length === 0) await cargarSelects();

            if (userRole === 'Medico') {
                // Filtrar por médico logueado si es necesario (aunque el backend debería hacerlo, aquí filtramos visualmente si el backend devuelve todo)
                // Nota: El backend actual devuelve TODO. Idealmente el backend debería filtrar.
                // Asumimos que el backend devuelve todo y filtramos aquí por seguridad visual, 
                // pero para seguridad real el backend debe filtrar.
                // Como no tenemos el ID del médico en localStorage de forma fiable (solo userRole), 
                // dependemos de que el usuario seleccione su nombre o implementamos lógica adicional.
                // Por ahora mostramos todo o filtramos por texto.
            }

            const filtroLower = filtro.toLowerCase();
            if (filtroLower) {
                citas = citas.filter(c => {
                    const paciente = pacientesCache.find(p => String(p.id) === String(c.pacienteId));
                    const medico = medicosCache.find(m => String(m.id) === String(c.medicoId));
                    const pName = paciente ? paciente.nombre.toLowerCase() : '';
                    const mName = medico ? medico.nombre.toLowerCase() : '';
                    return pName.includes(filtroLower) || mName.includes(filtroLower);
                });
            }

            tablaBody.innerHTML = '';
            if (citas.length === 0) { tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay citas.</td></tr>'; return; }

            citas.forEach(c => {
                const paciente = pacientesCache.find(p => String(p.id) === String(c.pacienteId));
                const medico = medicosCache.find(m => String(m.id) === String(c.medicoId));

                const estatusPago = c.pagoEstatus || 'Pendiente';
                const clasePago = estatusPago === 'Pagado' ? 'status-pagado' : 'status-pendiente';
                const claseEstatus = (c.estatus || '').toLowerCase();

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatearFecha(c.fecha)}</td>
                    <td>${paciente ? paciente.nombre : 'N/A'}</td>
                    <td>${medico ? medico.nombre : 'N/A'}</td>
                    <td><span class="status status-${claseEstatus}">${c.estatus || ''}</span></td>
                    <td><span class="status ${clasePago}">${estatusPago}</span></td>
                    <td class="actions-cell">
                        ${userRole === 'Medico' ?
                        `<button class="btn btn-primary btn-atender-cita" data-cita-id="${c.id}" data-paciente-id="${c.pacienteId}">
                            <i class="fas fa-stethoscope"></i> ${c.estatus === 'Realizada' ? 'Ver Exp.' : 'Atender'}
                        </button>` : ''
                    }
                        ${userRole !== 'Medico' ?
                        `<button class="btn btn-edit btn-editar-cita" data-id="${c.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger btn-eliminar-cita" data-id="${c.id}"><i class="fas fa-trash"></i> Eliminar</button>` : ''
                    }
                    </td>
                `;
                tablaBody.appendChild(tr);
            });
            asignarEventos();
        } catch (e) { tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red">Error al cargar</td></tr>'; console.error(e); }
    };

    const asignarEventos = () => {
        document.querySelectorAll('.btn-editar-cita').forEach(b => b.addEventListener('click', handleEditar));
        document.querySelectorAll('.btn-eliminar-cita').forEach(b => b.addEventListener('click', handleEliminar));
        document.querySelectorAll('.btn-atender-cita').forEach(b => b.addEventListener('click', handleAtender));
    };

    const handleAtender = (event) => {
        const citaId = event.currentTarget.dataset.citaId;
        const pacienteId = event.currentTarget.dataset.pacienteId;
        window.location.href = `consulta.html?citaId=${citaId}&pacienteId=${pacienteId}`;
    };

    const handleEditar = async (ev) => {
        const id = ev.currentTarget.dataset.id;
        try {
            const res = await apiList();
            if (!res.success) throw new Error(res.message || 'Error');
            const cita = (res.data || []).find(x => String(x.id) === String(id));
            if (!cita) return;

            if (pacientesCache.length === 0) await cargarSelects();

            citaIdInput.value = cita.id;
            pacienteSelect.value = cita.pacienteId || '';
            medicoSelect.value = cita.medicoId || '';

            const dt = new Date(cita.fecha);
            const pad = n => String(n).padStart(2, '0');
            fechaInput.value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

            estatusSelect.value = cita.estatus || 'Programada';
            motivoInput.value = cita.motivo || '';
            formContainer.style.display = 'block';
        } catch (e) { console.error(e); }
    };

    const handleEliminar = async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm('¿Eliminar esta cita?')) return;
        try {
            const res = await postForm({ action: 'delete', id });
            if (!res.success) throw new Error(res.message || 'Error');
            window.registrarBitacora('Agenda', 'Eliminación', `Se eliminó la cita ID: ${id}.`);
            renderizarTabla();
        } catch (e) {
            console.error(e);
            if (typeof Validaciones !== 'undefined') Validaciones.mostrarError(e.message || 'Error al eliminar');
            else alert(e.message);
        }
    };

    citaForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
            const id = citaIdInput.value;
            const pacienteId = pacienteSelect.value;
            const medicoId = medicoSelect.value;
            const fecha = fechaInput.value;
            const estatus = estatusSelect.value;
            const motivo = motivoInput.value.trim();

            if (typeof Validaciones !== 'undefined') {
                Validaciones.validarCampoTexto(motivo || 'Sin motivo', 'Motivo');
                if (!pacienteId || !medicoId || !fecha) { Validaciones.mostrarError('Paciente, médico y fecha son requeridos'); return; }
            }

            let res;
            const payload = { pacienteId, medicoId, fecha, estatus, motivo };

            if (id) {
                payload.action = 'update';
                payload.id = id;
                res = await postForm(payload);
            } else {
                payload.action = 'create';
                res = await postForm(payload);
            }

            if (!res || !res.success) throw new Error(res.message || 'Error al guardar');

            const pName = pacientesCache.find(p => String(p.id) === String(pacienteId))?.nombre || 'N/A';
            window.registrarBitacora('Agenda', id ? 'Actualización' : 'Creación', `Se guardó cita para '${pName}'.`);

            renderizarTabla();
            formContainer.style.display = 'none';
            citaForm.reset();
        } catch (e) {
            console.error(e);
            if (typeof Validaciones !== 'undefined') Validaciones.mostrarError(e.message || 'Error');
            else alert(e.message);
        }
    });

    btnNueva.addEventListener('click', () => {
        citaIdInput.value = '';
        // Asegurar selects cargados
        if (pacienteSelect.options.length <= 1) cargarSelects();
        formContainer.style.display = 'block';
    });

    btnCancelar.addEventListener('click', () => { formContainer.style.display = 'none'; citaForm.reset(); citaIdInput.value = ''; });

    if (searchBar) {
        searchBar.addEventListener('keyup', (event) => {
            renderizarTabla(event.target.value);
        });
    }

    if (userRole === 'Medico') {
        btnNueva.style.display = 'none';
    }

    // Inicializar
    cargarSelects();
    renderizarTabla();
});