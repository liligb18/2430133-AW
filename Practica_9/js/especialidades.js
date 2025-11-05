
document.addEventListener('DOMContentLoaded', () => {

    
    const rolesPermitidos = ['Admin']; // SOLO ADMIN
    const userRole = localStorage.getItem('userRole');

    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado. No tienes permisos para gestionar especialidades.');
        window.location.href = 'index.html';
        return;
    }

    // --- 1. Llave de Local Storage ---
    const ESPECIALIDADES_KEY = 'especialidades_db';

  
    // --- 2. DOM ---
    const formContainer = document.getElementById('form-container-especialidad');
    const especialidadForm = document.getElementById('form-especialidad');
    const especialidadIdInput = document.getElementById('especialidad-id');
    const nombreInput = document.getElementById('nombre-especialidad');
    const descripcionInput = document.getElementById('descripcion-especialidad');
    const btnNuevaEspecialidad = document.getElementById('btn-nueva-especialidad');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaEspecialidadesBody = document.getElementById('tabla-especialidades-body');

    // --- 3. Funciones  ---
    const getEspecialidades = () => {
        const data = localStorage.getItem(ESPECIALIDADES_KEY);
        return data ? JSON.parse(data) : [];
    };
    const saveEspecialidades = (data) => {
        localStorage.setItem(ESPECIALIDADES_KEY, JSON.stringify(data));
    };

    // --- 4. Funciones Principales ---
    const renderizarTabla = () => {
        const especialidades = getEspecialidades();
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
                    <button class="btn btn-danger btn-eliminar-esp" data-id="${esp.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaEspecialidadesBody.appendChild(tr);
        });
        asignarEventosBotones();
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-esp').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-esp').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const id = especialidadIdInput.value;
        const data = {
            id: id || `esp_id_${Date.now()}`,
            nombre: nombreInput.value,
            descripcion: descripcionInput.value
        };
        const especialidades = getEspecialidades();
        if (id) {
            const index = especialidades.findIndex(e => e.id === id);
            if (index !== -1) {
                especialidades[index] = data;
            }
        } else {
            if (especialidades.some(e => e.nombre.toLowerCase() === data.nombre.toLowerCase())) {
                alert('Error: Ya existe una especialidad con ese nombre.');
                return;
            }
            especialidades.push(data);
        }
        saveEspecialidades(especialidades);
        renderizarTabla();
        ocultarFormulario();
    };
    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const especialidades = getEspecialidades();
        const data = especialidades.find(e => e.id === id);
        if (!data) return;
        especialidadIdInput.value = data.id;
        nombreInput.value = data.nombre;
        descripcionInput.value = data.descripcion;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        if (!confirm('¿Estás seguro de eliminar esta especialidad?')) {
            return;
        }
        let especialidades = getEspecialidades();
        especialidades = especialidades.filter(e => e.id !== id);
        saveEspecialidades(especialidades);
        renderizarTabla();
    };
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        especialidadForm.reset();
        especialidadIdInput.value = '';
    };

    // --- 5. Eventos ---
    especialidadForm.addEventListener('submit', handleFormSubmit);
    btnNuevaEspecialidad.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);

    renderizarTabla();
});