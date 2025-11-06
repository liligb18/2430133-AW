document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const USERS_KEY = 'usuarios_db';
    const MEDICOS_KEY = 'medicos_db';
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
    const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const saveUsers = (data) => localStorage.setItem(USERS_KEY, JSON.stringify(data));
    const getMedicos = () => JSON.parse(localStorage.getItem(MEDICOS_KEY) || '[]');

    const cargarSelectMedicos = () => {
        const medicos = getMedicos();
        medicoLinkSelect.innerHTML = '<option value="">Ninguno</option>';
        medicos.forEach(m => {
            const option = document.createElement('option');
            option.value = m.id;
            option.textContent = m.nombre;
            medicoLinkSelect.appendChild(option);
        });
    };
    rolInput.addEventListener('change', () => {
        campoMedicoLink.style.display = rolInput.value === 'Medico' ? 'block' : 'none';
    });
    const renderizarTabla = () => {
        const usuarios = getUsers();
        const medicos = getMedicos();
        tablaUsuariosBody.innerHTML = '';
        usuarios.forEach(user => {
            let medicoVinculado = "N/A";
            if (user.medicoId) {
                const medico = medicos.find(m => m.id === user.medicoId);
                medicoVinculado = medico ? medico.nombre : "ID No Encontrado";
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.rol}</td>
                <td>${medicoVinculado}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-usuario" data-id="${user.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${user.id !== 'user_admin' ? 
                    `<button class="btn btn-danger btn-eliminar-usuario" data-id="${user.id}" data-username="${user.username}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>` : ''}
                </td>
            `;
            tablaUsuariosBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    
    const handleFormSubmit = (event) => {
        event.preventDefault();
        try {
            // --- INICIO VALIDACIONES ---
            const id = userIdInput.value;
            const usuarios = getUsers();
            const username = Validaciones.validarCampoTexto(usernameInput.value, 'Nombre de Usuario');
            const rol = Validaciones.validarCampoTexto(rolInput.value, 'Rol');
            
            // Validar que el username no se repita
            const usuarioExistente = usuarios.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (usuarioExistente && usuarioExistente.id !== id) {
                Validaciones.mostrarError('El nombre de usuario ya existe.');
            }
            
            // Validar contraseña
            const password = Validaciones.validarPassword(passwordInput.value, !id); // Es 'nuevo' si no hay ID
            // --- FIN VALIDACIONES ---
            
            const data = {
                id: id || `user_${Date.now()}`,
                username: username,
                rol: rol,
                medicoId: rol === 'Medico' ? medicoLinkSelect.value : null
            };

            let accionBitacora = 'Actualización';
            if (id) {
                const index = usuarios.findIndex(u => u.id === id);
                if (index === -1) return;
                const passwordAnterior = usuarios[index].password;
                data.password = password ? password : passwordAnterior; // Usamos la 'contraseña' validada
                usuarios[index] = data;
            } else {
                accionBitacora = 'Creación';
                data.password = password; // Usamos la 'contraseña' validada
                usuarios.push(data);
            }
            saveUsers(usuarios);
            
            window.registrarBitacora('Usuarios', accionBitacora, `Se guardó el usuario '${data.username}' (Rol: ${data.rol}).`);
            
            renderizarTabla();
            ocultarFormulario();
        } catch (error) {
            console.warn(error.message);
        }
    };

    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const data = getUsers().find(u => u.id === id);
        if (!data) return;
        userIdInput.value = data.id;
        usernameInput.value = data.username;
        rolInput.value = data.rol;
        medicoLinkSelect.value = data.medicoId || "";
        passwordInput.value = "";
        rolInput.dispatchEvent(new Event('change')); 
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const username = event.currentTarget.dataset.username;
        if (id === 'user_admin') {
            alert('No se puede eliminar al administrador por defecto.');
            return;
        }
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        let usuarios = getUsers();
        usuarios = usuarios.filter(u => u.id !== id);
        saveUsers(usuarios);
        window.registrarBitacora('Usuarios', 'Eliminación', `Se eliminó al usuario '${username}'.`);
        renderizarTabla();
    };
    const mostrarFormulario = () => {
        cargarSelectMedicos();
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
    renderizarTabla();
});