/* === SCRIPT MÓDULO DE PACIENTES (MODO API) === */
document.addEventListener('DOMContentLoaded', () => {
    
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    
    const API_URL = 'api/pacientes_api.php';

    // (Referencias al DOM...)
    const formContainer = document.getElementById('form-container-paciente');
    const pacienteForm = document.getElementById('form-paciente');
    const pacienteIdInput = document.getElementById('paciente-id');
    const nombreInput = document.getElementById('nombre');
    const curpInput = document.getElementById('curp');
    const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
    const sexoInput = document.getElementById('sexo');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');
    const direccionInput = document.getElementById('direccion');
    const contactoEmergenciaInput = document.getElementById('contacto-emergencia');
    const telefonoEmergenciaInput = document.getElementById('telefono-emergencia');
    const alergiasInput = document.getElementById('alergias');
    const antecedentesInput = document.getElementById('antecedentes');
    const btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaPacientesBody = document.getElementById('tabla-pacientes-body');
    const searchBar = document.getElementById('search-bar');
    
    // --- Funciones Helper (MODIFICADAS) ---
    
    const getPacientes = async () => {
        try {
            const respuesta = await fetch(API_URL); // GET por defecto
            if (!respuesta.ok) {
                console.error("Respuesta del servidor no OK:", respuesta);
                throw new Error('Error de red o del servidor al obtener pacientes.');
            }
            const pacientes = await respuesta.json();
            
            if (pacientes.error) {
                throw new Error(pacientes.error);
            }
            return pacientes;

        } catch (error) {
            console.error(error.message);
            alert('Error: No se pudo cargar la lista de pacientes.');
            return []; 
        }
    };
    
    // --- Funciones del CRUD (MODIFICADAS) ---

    const renderizarTabla = async (filtro = '') => {
        let pacientes;
        try {
            pacientes = await getPacientes();
        } catch (error) {
            tablaPacientesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos.</td></tr>`;
            return;
        }

        const filtroLower = filtro.toLowerCase();
        if (filtroLower) {
            pacientes = pacientes.filter(p => 
                p.NombreCompleto.toLowerCase().includes(filtroLower) ||
                (p.CURP && p.CURP.toLowerCase().includes(filtroLower)) ||
                (p.Telefono && p.Telefono.toLowerCase().includes(filtroLower))
            );
        }
        
        tablaPacientesBody.innerHTML = '';
        if (pacientes.length === 0) {
            tablaPacientesBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay pacientes ${filtro ? 'que coincidan' : 'registrados'}.</td></tr>`;
            return;
        }

        pacientes.forEach(paciente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${paciente.NombreCompleto}</td>
                <td>${paciente.CURP}</td>
                <td>${paciente.Telefono}</td>
                <td>${paciente.CorreoElectronico}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit btn-editar-paciente" data-id="${paciente.IdPaciente}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-eliminar-paciente" data-id="${paciente.IdPaciente}" data-nombre="${paciente.NombreCompleto}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaPacientesBody.appendChild(tr);
        });
        asignarEventosBotones();
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar-paciente').forEach(btn => {
            btn.addEventListener('click', handleEditar);
        });
        document.querySelectorAll('.btn-eliminar-paciente').forEach(btn => {
            if (userRole === 'Admin' || userRole === 'Recepcionista') {
                btn.addEventListener('click', handleEliminar);
            } else {
                btn.style.display = 'none';
            }
        });
    };
    
    /**
     * Guarda el paciente (NUEVO o EDITADO) en la API de PHP.
     * (CON MANEJO DE ERRORES MEJORADO)
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        let pacienteData; // Para poder usarla en el log de error

        try {
            // (Tus validaciones de js/validaciones.js)
            const id = pacienteIdInput.value;
            const nombre = Validaciones.validarCampoTexto(nombreInput.value, 'Nombre Completo');
            const fechaNacimiento = Validaciones.validarFechaNoFutura(fechaNacimientoInput.value, 'Fecha de Nacimiento');
            const sexo = Validaciones.validarCampoTexto(sexoInput.value, 'Sexo');
            const curp = Validaciones.validarCURP(curpInput.value);
            const telefono = Validaciones.validarTelefono(telefonoInput.value);
            const email = Validaciones.validarEmail(emailInput.value);
            const telefonoEmergencia = Validaciones.validarTelefono(telefonoEmergenciaInput.value);

            pacienteData = {
                id: id || null, 
                nombre: nombre,
                curp: curp,
                fechaNacimiento: fechaNacimiento,
                sexo: sexo,
                telefono: telefono,
                email: email,
                direccion: direccionInput.value.trim(),
                contactoEmergencia: contactoEmergenciaInput.value.trim(),
                telefonoEmergencia: telefonoEmergencia,
                alergias: alergiasInput.value.trim(),
                antecedentes: antecedentesInput.value.trim()
            };
            
            const respuesta = await fetch(API_URL, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacienteData) 
            });

            // --- MEJORA DE DEPURACIÓN ---
            // Leemos la respuesta como TEXTO, no como JSON todavía
            const respuestaTexto = await respuesta.text();

            if (!respuesta.ok) {
                // Si el código es 500, 404, etc., respuestaTexto será el error de PHP
                // (Ej. "Fatal error:...")
                throw new Error(`Error del Servidor (${respuesta.status}): ${respuestaTexto}`);
            }

            // Si la respuesta.ok es true (200), AHORA SÍ intentamos parsear el JSON
            const resultado = JSON.parse(respuestaTexto);

            if (resultado.error) {
                // Esto es si PHP nos devuelve un error controlado (ej. CURP duplicada)
                throw new Error(resultado.error);
            }
            // --- FIN DE LA MEJORA ---

            // Si todo salió bien:
            renderizarTabla(searchBar.value);
            ocultarFormulario();

        } catch (error) {
            // Este catch AHORA SÍ nos mostrará el error de PHP
            alert(`Error al guardar: ${error.message}`);
            console.error("Detalle del error:", error);
            console.error("Datos enviados:", pacienteData); // Muestra qué intentamos enviar
        }
    };

    /**
     * Rellena el formulario (igual, pero ASÍNCRONO)
     */
    const handleEditar = async (event) => {
        const id = event.currentTarget.dataset.id;
        const pacientes = await getPacientes();
        const paciente = pacientes.find(p => p.IdPaciente == id); 
        
        if (!paciente) return;
        
        pacienteIdInput.value = paciente.IdPaciente;
        nombreInput.value = paciente.NombreCompleto;
        curpInput.value = paciente.CURP;
        fechaNacimientoInput.value = paciente.FechaNacimiento;
        sexoInput.value = paciente.Sexo;
        telefonoInput.value = paciente.Telefono;
        emailInput.value = paciente.CorreoElectronico;
        direccionInput.value = paciente.Direccion;
        contactoEmergenciaInput.value = paciente.ContactoEmergencia;
        telefonoEmergenciaInput.value = paciente.TelefonoEmergencia;
        alergiasInput.value = paciente.Alergias;
        antecedentesInput.value = paciente.AntecedentesMedicos;
        
        const esMedico = userRole === 'Medico';
        nombreInput.disabled = esMedico;
        curpInput.disabled = esMedico;
        fechaNacimientoInput.disabled = esMedico;
        sexoInput.disabled = esMedico;
        telefonoInput.disabled = esMedico;
        emailInput.disabled = esMedico;
        direccionInput.disabled = esMedico;
        contactoEmergenciaInput.disabled = esMedico;
        telefonoEmergenciaInput.disabled = esMedico;
        alergiasInput.disabled = false;
        antecedentesInput.disabled = false;
        
        mostrarFormulario();
    };

    /**
     * Borra un paciente (ASÍNCRONO)
     */
    const handleEliminar = async (event) => {
        const id = event.currentTarget.dataset.id;
        const nombre = event.currentTarget.dataset.nombre;
        if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
        
        try {
            const respuesta = await fetch(`${API_URL}?id=${id}&nombre=${encodeURIComponent(nombre)}`, {
                method: 'DELETE'
            });

            // Usamos la misma lógica de depuración
            const respuestaTexto = await respuesta.text();
            if (!respuesta.ok) {
                 throw new Error(`Error del Servidor (${respuesta.status}): ${respuestaTexto}`);
            }
            const resultado = JSON.parse(respuestaTexto);
            if (resultado.error) {
                throw new Error(resultado.error);
            }
            
            renderizarTabla(searchBar.value);
        
        } catch (error) {
            alert(error.message);
            console.warn(error.message);
        }
    };
    
    // (Funciones auxiliares y eventos)
    const mostrarFormulario = () => {
        formContainer.style.display = 'block';
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        pacienteForm.reset(); 
        pacienteIdInput.value = '';
        document.querySelectorAll('#form-paciente input, #form-paciente select, #form-paciente textarea').forEach(el => el.disabled = false);
    };
    pacienteForm.addEventListener('submit', handleFormSubmit);
    btnNuevoPaciente.addEventListener('click', () => {
        ocultarFormulario();
        mostrarFormulario();
    });
    btnCancelar.addEventListener('click', ocultarFormulario);
    searchBar.addEventListener('keyup', (event) => {
        renderizarTabla(event.target.value);
    });
    if (userRole === 'Medico') {
        btnNuevoPaciente.style.display = 'none';
    }

    // --- Carga Inicial ---
    renderizarTabla(); 
});