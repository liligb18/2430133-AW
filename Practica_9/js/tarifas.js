document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const TARIFAS_KEY = 'tarifas_db';
    const formContainer = document.getElementById('form-container-tarifa');
    const tarifaForm = document.getElementById('form-tarifa');
    const tarifaIdInput = document.getElementById('tarifa-id');
    const nombreInput = document.getElementById('nombre-tarifa');
    const costoInput = document.getElementById('costo-tarifa');
    const btnNuevaTarifa = document.getElementById('btn-nueva-tarifa');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaTarifasBody = document.getElementById('tabla-tarifas-body');
    const getTarifas = () => JSON.parse(localStorage.getItem(TARIFAS_KEY) || '[]');
    const saveTarifas = (data) => localStorage.setItem(TARIFAS_KEY, JSON.stringify(data));

    const renderizarTabla = () => {
        const tarifas = getTarifas();
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
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-tarifa').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-tarifa').forEach(btn => {
            btn.addEventListener('click', handleEliminar);
        });
    };
    
    const handleFormSubmit = (event) => {
        event.preventDefault();
        try {
            // --- INICIO VALIDACIONES ---
            const id = tarifaIdInput.value;
            const nombre = Validaciones.validarCampoTexto(nombreInput.value, 'Nombre del Servicio');
            const costo = Validaciones.validarCosto(costoInput.value);
            // --- FIN VALIDACIONES ---
            
            const data = { id: id || `tarifa_${Date.now()}`, nombre: nombre, costo: costo };
            const tarifas = getTarifas();
            let accionBitacora = 'Actualización';
            
            if (id) {
                const index = tarifas.findIndex(t => t.id === id);
                if (index !== -1) tarifas[index] = data;
            } else {
                accionBitacora = 'Creación';
                tarifas.push(data);
            }
            saveTarifas(tarifas);
            
            window.registrarBitacora('Tarifas', accionBitacora, `Se guardó la tarifa '${data.nombre}' (Costo: $${data.costo}).`);
            
            renderizarTabla();
            ocultarFormulario();
        } catch (error) {
            console.warn(error.message);
        }
    };

    const handleEditar = (event) => {
        const id = event.currentTarget.dataset.id;
        const data = getTarifas().find(t => t.id === id);
        if (!data) return;
        tarifaIdInput.value = data.id;
        nombreInput.value = data.nombre;
        costoInput.value = data.costo;
        mostrarFormulario();
    };
    const handleEliminar = (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm('¿Estás seguro de eliminar esta tarifa?')) return;
        
        let tarifas = getTarifas();
        tarifas = tarifas.filter(t => t.id !== id);
        saveTarifas(tarifas);
        
        window.registrarBitacora('Tarifas', 'Eliminación', `Se eliminó la tarifa '${nombre}'.`);
        
        renderizarTabla();
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