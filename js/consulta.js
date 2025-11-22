document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    // --- API Endpoints ---
    const API_EXPEDIENTES = 'php/api/expedientes.php';
    const API_AGENDA = 'php/api/agenda.php';
    const API_PACIENTES = 'php/api/pacientes.php';
    const API_MEDICOS = 'php/api/medicos.php';

    // --- DOM Elements ---
    const headerInfo = document.getElementById('info-paciente-header');
    const datosFijosDiv = document.getElementById('datos-paciente-fijos');
    const historialDiv = document.getElementById('historial-consultas');
    const infoCitaFecha = document.getElementById('info-cita-fecha');
    const motivoTextarea = document.getElementById('motivo-consulta');
    const diagnosticoTextarea = document.getElementById('diagnostico');
    const tratamientoTextarea = document.getElementById('tratamiento');
    const notasTextarea = document.getElementById('notas-medicas');
    const consultaForm = document.getElementById('form-consulta');
    const btnVolver = document.getElementById('btn-volver-agenda');

    let citaId = null;
    let pacienteId = null;
    let medicoId = null;

    // --- API Helpers ---
    const authHeaders = () => ({
        'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0',
        'X-User-Role': localStorage.getItem('userRole') || ''
    });

    const postForm = (url, data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(url, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(res => res.json());
    })();

    const fetchData = (url) => fetch(url, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };

    const cargarDatosPaciente = async (id) => {
        try {
            const res = await fetchData(API_PACIENTES); // Idealmente debería haber un endpoint para obtener un solo paciente
            if (!res.success) throw new Error('Error al cargar pacientes');
            const paciente = (res.data || []).find(p => String(p.id) === String(id));

            if (!paciente) {
                headerInfo.textContent = "Error: Paciente no encontrado";
                return;
            }
            headerInfo.textContent = `Paciente: ${paciente.nombre} (CURP: ${paciente.curp || 'N/A'})`;
            datosFijosDiv.innerHTML = `
                <p><strong>Teléfono:</strong> ${paciente.telefono || 'N/A'}</p>
                <p><strong>Correo:</strong> ${paciente.email || 'N/A'}</p>
                <p><strong>Alergias:</strong> <span class="alergias">${paciente.alergias || 'Ninguna registrada'}</span></p>
                <p><strong>Antecedentes:</strong> ${paciente.antecedentes || 'Ninguno registrado'}</p>
            `;
        } catch (e) {
            console.error(e);
            headerInfo.textContent = "Error al cargar datos del paciente";
        }
    };

    const cargarHistorial = async (pid) => {
        historialDiv.innerHTML = '<p>Cargando historial...</p>';
        try {
            const [resExp, resMed] = await Promise.all([
                fetchData(`${API_EXPEDIENTES}?pacienteId=${pid}`),
                fetchData(API_MEDICOS)
            ]);

            const expedientes = (resExp.success && resExp.data) ? resExp.data : [];
            const medicos = (resMed.success && resMed.data) ? resMed.data : [];

            historialDiv.innerHTML = '';
            if (expedientes.length === 0) {
                historialDiv.innerHTML = '<p>No hay consultas previas registradas.</p>';
                return;
            }

            expedientes.forEach(exp => {
                const medico = medicos.find(m => String(m.id) === String(exp.medicoId));
                const nombreMedico = medico ? medico.nombre : 'Dr. Desconocido';
                const item = document.createElement('div');
                item.className = 'historial-item';
                item.innerHTML = `
                    <strong>${formatearFecha(exp.fecha)}</strong> (Atendió: ${nombreMedico})
                    <p><strong>Dx:</strong> ${exp.diagnostico || 'Sin diagnóstico'}</p>
                `;
                historialDiv.appendChild(item);
            });
        } catch (e) {
            console.error(e);
            historialDiv.innerHTML = '<p>Error al cargar historial.</p>';
        }
    };

    const cargarDatosCita = async (cid) => {
        try {
            const res = await fetchData(API_AGENDA);
            if (!res.success) throw new Error('Error al cargar citas');
            const cita = (res.data || []).find(c => String(c.id) === String(cid));

            if (!cita) {
                alert('Cita no encontrada');
                window.location.href = 'agenda.html';
                return;
            }

            infoCitaFecha.textContent = formatearFecha(cita.start); // 'start' viene del formato FullCalendar en agenda.php
            motivoTextarea.value = cita.title || 'No se especificó motivo.'; // 'title' se usa como motivo en agenda.php
            medicoId = cita.medicoId; // Asegurarse que agenda.php devuelva medicoId

            // Si la cita ya fue realizada, intentar cargar el expediente asociado
            // Nota: Esto es complejo porque no hay link directo Cita->Expediente en la BD actual.
            // Por ahora, asumimos que si el estatus es 'Realizada', bloqueamos la edición.
            if (cita.estatus === 'Realizada') {
                diagnosticoTextarea.disabled = true;
                tratamientoTextarea.disabled = true;
                notasTextarea.disabled = true;
                consultaForm.querySelector('button[type="submit"]').disabled = true;
                consultaForm.querySelector('button[type="submit"]').textContent = 'Consulta Finalizada';
                alert('Esta cita ya fue atendida.');
            }

        } catch (e) {
            console.error(e);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            const diagnostico = Validaciones.validarCampoTexto(diagnosticoTextarea.value, 'Diagnóstico');
            const tratamiento = Validaciones.validarCampoTexto(tratamientoTextarea.value, 'Tratamiento');
            const notas = notasTextarea.value.trim();

            // 1. Guardar Expediente
            const expedienteData = {
                action: 'create',
                pacienteId: pacienteId,
                medicoId: medicoId,
                diagnostico: diagnostico,
                tratamiento: tratamiento,
                notas: notas,
                sintomas: motivoTextarea.value // Usamos el motivo como síntomas iniciales
            };

            const resExp = await postForm(API_EXPEDIENTES, expedienteData);
            if (!resExp.success) throw new Error(resExp.message || 'Error al guardar expediente');

            // 2. Actualizar Estatus de Cita
            if (citaId) {
                // Necesitamos un endpoint para actualizar solo el estatus o usar el update completo
                // Por simplicidad y dado el API actual, intentaremos actualizar el estatus si es posible.
                // El API agenda.php 'update' requiere todos los campos. Esto es una limitación.
                // Workaround: No actualizamos el estatus automáticamente por ahora para evitar borrar datos,
                // O hacemos un fetch de la cita, cambiamos el estatus y enviamos todo de nuevo.

                // Opción segura: Solo registrar bitácora y avisar.
                // Opción ideal: Mejorar agenda.php para patch status.

                // Vamos a intentar actualizar el estatus obteniendo los datos actuales primero.
                const resCitas = await fetchData(API_AGENDA);
                const citaActual = (resCitas.data || []).find(c => String(c.id) === String(citaId));
                if (citaActual) {
                    const updateData = {
                        action: 'update',
                        id: citaId,
                        pacienteId: citaActual.pacienteId,
                        medicoId: citaActual.medicoId,
                        fecha: citaActual.start, // Asumiendo formato compatible
                        motivo: citaActual.title,
                        estatus: 'Realizada'
                    };
                    await postForm(API_AGENDA, updateData);
                }
            }

            window.registrarBitacora('Consulta', 'Registro', `Se guardó expediente para paciente ID ${pacienteId}.`);

            alert('Consulta guardada exitosamente.');
            window.location.href = 'agenda.html';

        } catch (error) {
            console.warn(error.message);
            alert('Error: ' + error.message);
        }
    };

    const init = () => {
        const params = new URLSearchParams(window.location.search);
        citaId = params.get('citaId');
        pacienteId = params.get('pacienteId');

        if (!citaId || !pacienteId) {
            alert('Error: No se especificó una cita o paciente.');
            window.location.href = 'agenda.html';
            return;
        }

        cargarDatosPaciente(pacienteId);
        cargarHistorial(pacienteId);
        cargarDatosCita(citaId);
    };

    consultaForm.addEventListener('submit', handleFormSubmit);
    btnVolver.addEventListener('click', () => {
        window.location.href = 'agenda.html';
    });

    init();
});