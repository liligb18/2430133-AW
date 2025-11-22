document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    const API_USERS = 'php/api/usuarios.php';
    const API_MEDICOS = 'php/api/medicos.php';

    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });

    const postForm = (data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(API_USERS, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json());
    })();

    const apiListUsers = () => fetch(API_USERS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListMedicos = () => fetch(API_MEDICOS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    const formContainer = document.getElementById('form-container-usuario');
    const userForm = document.getElementById('form-usuario');
    const userIdInput = document.getElementById('usuario-id');
    const usernameInput = document.getElementById('username');
    const rolInput = document.getElementById('rol');
    const passwordInput = document.getElementById('password');
    const medicoLinkSelect = document.getElementById('medico-link');
    const campoMedicoLink = document.getElementById('campo-medico-link');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaUsuariosBody = document.getElementById('tabla-usuarios-body');

    // Variables globales para caché simple
    let medicosCache = [];

    const cargarSelectMedicos = async () => {
        try {
            const res = await apiListMedicos();
            medicosCache = (res.success && res.data) ? res.data : [];

            medicoLinkSelect.innerHTML = '<option value="">Ninguno</option>';
            medicosCache.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = m.nombre;
                medicoLinkSelect.appendChild(option);
            });
        } catch (e) {
            console.error("Error cargando médicos:", e);
            medicoLinkSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    };

    rolInput.addEventListener('change', () => {
        campoMedicoLink.style.display = rolInput.value === 'Medico' ? 'block' : 'none';
    });

    const renderizarTabla = async () => {
        try {
            tablaUsuariosBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Cargando...</td></tr>';

            // Cargamos usuarios y aseguramos tener médicos para mostrar nombres
            const [resUsers, resMedicos] = await Promise.all([apiListUsers(), apiListMedicos()]);

            const usuarios = (resUsers.success && resUsers.data) ? resUsers.data : [];
            medicosCache = (resMedicos.success && resMedicos.data) ? resMedicos.data : [];

            tablaUsuariosBody.innerHTML = '';
            if (usuarios.length === 0) {
                tablaUsuariosBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No hay usuarios registrados.</td></tr>';
                return;
            }

            usuarios.forEach(user => {
                let medicoVinculado = "N/A";

                // Si es médico y tiene ID vinculado, buscamos el nombre
                if (user.rol === 'Medico' && user.medicoId) {
                    const medico = medicosCache.find(m => String(m.id) === String(user.medicoId));
                    medicoVinculado = medico ? medico.nombre : '(ID no encontrado)';
                } else if (user.rol === 'Medico') {
                    medicoVinculado = '(Sin vincular)';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        ${user.nombre}
                        ${user.rol === 'Medico' ? `<br><small class="text-muted"><i class="fas fa-user-md"></i> ${medicoVinculado}</small>` : ''}
                    </td>
                    <td>${user.rol}</td>
                    <td>${user.correo}</td>
                    <td class="actions-cell">
                        <button class="btn btn-edit btn-editar-usuario" data-id="${user.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${String(user.id) !== '1' ?
                        `<button class="btn btn-danger btn-eliminar-usuario" data-id="${user.id}" data-username="${user.nombre}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>` : ''}
                    </td>
                `;
                tablaUsuariosBody.appendChild(tr);
            });
            asignarEventosBotones();
        } catch (e) {
            tablaUsuariosBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red">Error al cargar</td></tr>';
            console.error(e);
        }
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            // --- INICIO VALIDACIONES ---
            const id = userIdInput.value;
            const username = Validaciones.validarCampoTexto(usernameInput.value, 'Nombre de Usuario');
            const correo = Validaciones.validarEmail(document.getElementById('email').value);
            const rol = Validaciones.validarCampoTexto(rolInput.value, 'Rol');
            // Validar contraseña (solo si es nuevo o si el campo no está vacío en edición)
            const password = passwordInput.value;
            if (!id && !password) throw new Error("La contraseña es obligatoria para nuevos usuarios.");
            if (password && password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");

            const medicoId = (rol === 'Medico') ? medicoLinkSelect.value : '';
            // --- FIN VALIDACIONES ---

            let res;
            const payload = {
                username: username,
                email: correo,
                rol: rol,
                password: password,
                medicoId: medicoId
            };

            if (id) {
                payload.action = 'update';
                payload.id = id;
                res = await postForm(payload);
            } else {
                payload.action = 'create';
                res = await postForm(payload);
            }

            if (!res || !res.success) throw new Error(res.message || 'Error al guardar');

            window.registrarBitacora('Usuarios', id ? 'Actualización' : 'Creación', `Se guardó el usuario '${username}' (Rol: ${rol}).`);

            renderizarTabla();
            ocultarFormulario();

        } catch (error) {
            console.warn(error.message);
            if (typeof Validaciones !== 'undefined') Validaciones.mostrarError(error.message);
            else alert(error.message);
        }
    };

    const handleEditar = async (event) => {
        const id = event.currentTarget.dataset.id;
        try {
            // Reutilizamos la lista actual si es posible, o recargamos
            const res = await apiListUsers();
            if (!res.success) throw new Error(res.message || 'Error');

            const data = (res.data || []).find(u => String(u.id) === String(id));
            if (!data) return;

            // Asegurar que el select de médicos esté cargado
            if (medicosCache.length === 0) await cargarSelectMedicos();
            else {
                // Regenerar opciones por si acaso
                medicoLinkSelect.innerHTML = '<option value="">Ninguno</option>';
                medicosCache.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.id;
                    option.textContent = m.nombre;
                    medicoLinkSelect.appendChild(option);
                });
            }

            userIdInput.value = data.id;
            usernameInput.value = data.nombre || '';
            document.getElementById('email').value = data.correo || '';
            rolInput.value = data.rol || '';

            // Seleccionar médico vinculado
            medicoLinkSelect.value = data.medicoId || '';

            passwordInput.value = ""; // Limpiar password

            // Disparar evento para mostrar/ocultar campo médico
            rolInput.dispatchEvent(new Event('change'));

            mostrarFormulario();
        } catch (e) { console.error(e); }
    };

    const handleEliminar = async (event) => {
        const id = event.currentTarget.dataset.id;
        const username = event.currentTarget.dataset.username;
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            const res = await postForm({ action: 'delete', id: id });
            if (!res.success) throw new Error(res.message || 'Error');

            window.registrarBitacora('Usuarios', 'Eliminación', `Se eliminó al usuario '${username}'.`);
            renderizarTabla();
        } catch (e) {
            console.error(e);
            if (typeof Validaciones !== 'undefined') Validaciones.mostrarError(e.message || 'Error al eliminar');
            else alert('Error al eliminar');
        }
    };

    const mostrarFormulario = () => {
        // Cargar médicos si no están cargados
        if (medicoLinkSelect.options.length <= 1) cargarSelectMedicos();
        formContainer.style.display = 'block';
    };

    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        userForm.reset();
        userIdInput.value = '';
        campoMedicoLink.style.display = 'none';
    };

    userForm.addEventListener('submit', handleFormSubmit);
    btnNuevoUsuario.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);

    // Carga inicial
    renderizarTabla();
});