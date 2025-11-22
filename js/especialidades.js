document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const API_ESPECIALIDADES = 'php/api/especialidades.php';
    const formContainer = document.getElementById('form-container-especialidad');
    const especialidadForm = document.getElementById('form-especialidad');
    const especialidadIdInput = document.getElementById('especialidad-id');
    const nombreInput = document.getElementById('nombre-especialidad');
    const descripcionInput = document.getElementById('descripcion-especialidad');
    const btnNuevaEspecialidad = document.getElementById('btn-nueva-especialidad');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaEspecialidadesBody = document.getElementById('tabla-especialidades-body');
    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });
    const postForm = (data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(API_ESPECIALIDADES, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json());
    })();
    const apiList = () => fetch(API_ESPECIALIDADES, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    const renderizarTabla = async () => {
        try {
            const res = await apiList();
            const especialidades = (res.success && res.data) ? res.data : [];
            tablaEspecialidadesBody.innerHTML = '';
            if (especialidades.length === 0) {
                tablaEspecialidadesBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay especialidades registradas.</td></tr>';
                return;
            }
            especialidades.forEach(esp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${esp.nombre}</td>
                <td>${esp.descripcion || ''}</td> 
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-esp" data-id="${esp.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-esp" data-id="${esp.id}" data-nombre="${esp.nombre}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaEspecialidadesBody.appendChild(tr);
            });
            asignarEventosBotones();
        } catch (e) {
            tablaEspecialidadesBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:red">Error al cargar</td></tr>';
            console.error(e);
        }
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-esp').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-esp').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const id = especialidadIdInput.value;
        const nombre = nombreInput.value.trim();
        const descripcion = descripcionInput.value.trim();
        try {
            let res;
            if (id) {
                res = await postForm({ action: 'update', id, nombre, descripcion });
            } else {
                res = await postForm({ action: 'create', nombre, descripcion });
            }
            if (!res.success) throw new Error(res.message || 'Error al guardar');
            window.registrarBitacora('Especialidades', id ? 'Actualización' : 'Creación', `Se guardó la especialidad '${nombre}'.`);
            renderizarTabla();
            ocultarFormulario();
        } catch (e) { alert(e.message || 'Error'); }
    };
    const handleEditar = async (event) => {
        const id = event.currentTarget.dataset.id;
        try {
            const res = await apiList();
            if (!res.success) throw new Error(res.message || 'Error');
            const data = (res.data || []).find(e => String(e.id) === String(id));
            if (!data) return;
            especialidadIdInput.value = data.id;
            nombreInput.value = data.nombre;
            descripcionInput.value = data.descripcion;
            mostrarFormulario();
        } catch (e) { console.error(e); }
    };
    const handleEliminar = async (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar esta especialidad?')) return;
        try {
            const res = await postForm({ action: 'delete', id });
            if (!res.success) throw new Error(res.message || 'Error');
            window.registrarBitacora('Especialidades', 'Eliminación', `Se eliminó la especialidad '${nombre}'.`);
            renderizarTabla();
        } catch (e) { console.error(e); alert('Error al eliminar'); }
    };
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        especialidadForm.reset();
        especialidadIdInput.value = '';
    };
    especialidadForm.addEventListener('submit', handleFormSubmit);
    btnNuevaEspecialidad.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    renderizarTabla();
});