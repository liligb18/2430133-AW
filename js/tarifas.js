document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const API_TARIFAS = 'php/api/tarifas.php';
    const formContainer = document.getElementById('form-container-tarifa');
    const tarifaForm = document.getElementById('form-tarifa');
    const tarifaIdInput = document.getElementById('tarifa-id');
    const nombreInput = document.getElementById('nombre-tarifa');
    const costoInput = document.getElementById('costo-tarifa');
    const btnNuevaTarifa = document.getElementById('btn-nueva-tarifa');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaTarifasBody = document.getElementById('tabla-tarifas-body');
    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });
    const postForm = (data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(API_TARIFAS, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json());
    })();
    const apiList = () => fetch(API_TARIFAS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    const renderizarTabla = async () => {
        try {
            const res = await apiList();
            const tarifas = (res.success && res.data) ? res.data : [];
            tablaTarifasBody.innerHTML = '';
            if (tarifas.length === 0) {
                tablaTarifasBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay tarifas registradas.</td></tr>';
                return;
            }
            tarifas.forEach(tarifa => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tarifa.nombre}</td>
                <td>$${parseFloat(tarifa.costo).toFixed(2)}</td> 
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-tarifa" data-id="${tarifa.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-tarifa" data-id="${tarifa.id}" data-nombre="${tarifa.nombre}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaTarifasBody.appendChild(tr);
            });
            asignarEventosBotones();
        } catch (e) { tablaTarifasBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:red">Error al cargar</td></tr>'; console.error(e); }
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-tarifa').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-tarifa').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            const id = tarifaIdInput.value;
            const nombre = Validaciones.validarCampoTexto(nombreInput.value, 'Nombre del Servicio');
            const costo = Validaciones.validarCosto(costoInput.value);
            let res;
            if (id) {
                res = await postForm({ action: 'update', id, nombre, costo });
            } else {
                res = await postForm({ action: 'create', nombre, costo });
            }
            if (!res.success) throw new Error(res.message || 'Error al guardar');
            window.registrarBitacora('Tarifas', id ? 'Actualización' : 'Creación', `Se guardó la tarifa '${nombre}' (Costo: $${costo}).`);
            renderizarTabla();
            ocultarFormulario();
        } catch (error) { console.warn(error.message); try { Validaciones.mostrarError(error.message || 'Error'); } catch(e) {} }
    };

    const handleEditar = async (event) => {
        const id = event.currentTarget.dataset.id;
        try {
            const res = await apiList();
            if (!res.success) throw new Error(res.message || 'Error');
            const data = (res.data || []).find(t => String(t.id) === String(id));
            if (!data) return;
            tarifaIdInput.value = data.id;
            nombreInput.value = data.nombre;
            costoInput.value = data.costo;
            mostrarFormulario();
        } catch (e) { console.error(e); }
    };
    const handleEliminar = async (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar esta tarifa?')) return;
        try {
            const res = await postForm({ action: 'delete', id });
            if (!res.success) throw new Error(res.message || 'Error');
            window.registrarBitacora('Tarifas', 'Eliminación', `Se eliminó la tarifa '${nombre}'.`);
            renderizarTabla();
        } catch (e) { console.error(e); try { Validaciones.mostrarError(e.message || 'Error al eliminar'); } catch(err) {} }
    };
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        tarifaForm.reset();
        tarifaIdInput.value = '';
    };
    tarifaForm.addEventListener('submit', handleFormSubmit);
    btnNuevaTarifa.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    renderizarTabla();
});