document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Recepcionista'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }
    const API_AGENDA = 'php/api/agenda.php';
    const API_PACIENTES = 'php/api/pacientes.php';
    const API_MEDICOS = 'php/api/medicos.php';
    const API_TARIFAS = 'php/api/tarifas.php';
    const API_PAGOS = 'php/api/pagos.php';
    const formContainer = document.getElementById('form-container-pago');
    const pagoForm = document.getElementById('form-pago');
    const citaIdInput = document.getElementById('pago-cita-id');
    const pacienteNombreSpan = document.getElementById('pago-paciente-nombre');
    const citaFechaSpan = document.getElementById('pago-cita-fecha');
    const tarifaSelect = document.getElementById('tarifa-select');
    const montoInput = document.getElementById('monto-pago');
    const btnCancelarPago = document.getElementById('btn-cancelar-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos-body');
    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });
    const postForm = (url, data) => (async () => {
        const token = await window.getCsrfToken();
        const payload = Object.assign({}, data, token ? { csrf_token: token } : {});
        const headers = Object.assign({ 'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders());
        return fetch(url, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json());
    })();
    const apiListAgenda = () => fetch(API_AGENDA, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListPacientes = () => fetch(API_PACIENTES, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListMedicos = () => fetch(API_MEDICOS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListTarifas = () => fetch(API_TARIFAS, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiCreatePago = (data) => postForm(API_PAGOS, Object.assign({ action: 'create' }, data));

    const cargarTarifasSelect = async () => {
        tarifaSelect.innerHTML = '<option value="">Cargando...</option>';
        try {
            const res = await apiListTarifas();
            tarifaSelect.innerHTML = '<option value="">Seleccione un servicio...</option>';
            const tarifas = (res.success && res.data) ? res.data : [];
            tarifas.forEach(t => {
                const option = document.createElement('option');
                option.value = `${t.id}|${t.costo}`;
                option.textContent = `${t.nombre} ($${t.costo})`;
                tarifaSelect.appendChild(option);
            });
        } catch (e) { tarifaSelect.innerHTML = '<option value="">Error</option>'; console.error(e); }
    };
    tarifaSelect.addEventListener('change', () => {
        const [tarifaId, costo] = tarifaSelect.value.split('|');
        if (costo) {
            montoInput.value = costo;
        } else {
            montoInput.value = "";
        }
    });
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };
    const renderizarTabla = async () => {
        tablaPagosBody.innerHTML = '<tr><td colspan="7" style="text-align:center">Cargando...</td></tr>';
        try {
            const [resAgenda, resPacientes, resMedicos] = await Promise.all([apiListAgenda(), apiListPacientes(), apiListMedicos()]);
            const citas = (resAgenda.success && resAgenda.data) ? resAgenda.data : [];
            const pacientes = (resPacientes.success && resPacientes.data) ? resPacientes.data : [];
            const medicos = (resMedicos.success && resMedicos.data) ? resMedicos.data : [];
            tablaPagosBody.innerHTML = '';
            const citasFiltradas = citas.filter(c => c.estatus !== 'Programada').sort((a,b)=> new Date(b.fecha) - new Date(a.fecha));
            if (citasFiltradas.length === 0) { tablaPagosBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay citas realizadas o confirmadas.</td></tr>'; return; }
            citasFiltradas.forEach(cita => {
                const paciente = pacientes.find(p => String(p.id) === String(cita.pacienteId));
                const medico = medicos.find(m => String(m.id) === String(cita.medicoId));
                const estatusPago = cita.pagoEstatus || 'Pendiente';
                const montoPagado = cita.montoPagado ? `$${parseFloat(cita.montoPagado).toFixed(2)}` : 'N/A';
                const clasePago = estatusPago === 'Pagado' ? 'status-pagado' : 'status-pendiente';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatearFecha(cita.fecha)}</td>
                    <td>${paciente ? paciente.nombre : 'N/A'}</td>
                    <td>${medico ? medico.nombre : 'N/A'}</td>
                    <td><span class="status status-${(cita.estatus||'').toLowerCase()}">${cita.estatus}</span></td>
                    <td><span class="status ${clasePago}">${estatusPago}</span></td>
                    <td>${montoPagado}</td>
                    <td class="actions-cell">
                        ${estatusPago === 'Pendiente' ? 
                        `<button class="btn btn-primary btn-registrar-pago" data-id="${cita.id}">
                            <i class="fas fa-dollar-sign"></i> Registrar Pago
                        </button>` :
                        `<button class="btn btn-secondary" disabled>Pagado</button>`
                        }
                    </td>
                `;
                tablaPagosBody.appendChild(tr);
            });
            asignarEventosBotones();
        } catch (e) { tablaPagosBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red">Error al cargar</td></tr>'; console.error(e); }
    };
    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-registrar-pago').forEach(btn => {
            btn.addEventListener('click', handleMostrarFormulario);
        });
    };
    const handleMostrarFormulario = (event) => {
        const id = event.currentTarget.dataset.id;
        (async () => {
            try {
                const [resAgenda, resPacientes] = await Promise.all([apiListAgenda(), apiListPacientes()]);
                const cita = (resAgenda.success && resAgenda.data ? resAgenda.data : []).find(c => String(c.id) === String(id));
                if (!cita) return;
                const paciente = (resPacientes.success && resPacientes.data ? resPacientes.data : []).find(p => String(p.id) === String(cita.pacienteId));
                citaIdInput.value = id;
                pacienteNombreSpan.textContent = paciente ? paciente.nombre : 'No encontrado';
                citaFechaSpan.textContent = formatearFecha(cita.fecha);
                await cargarTarifasSelect();
                montoInput.value = "";
                formContainer.style.display = 'block';
            } catch (e) { console.error(e); }
        })();
    };
    const ocultarFormulario = () => {
        formContainer.style.display = 'none';
        pagoForm.reset();
        citaIdInput.value = '';
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        (async () => {
            const id = citaIdInput.value;
            const [tarifaId, costo] = tarifaSelect.value.split('|');
            const montoFinal = montoInput.value;
            if (!tarifaId || !montoFinal) { alert('Debe seleccionar una tarifa y un monto.'); return; }
            try {
                // Necesitamos el pacienteId para la cita
                const resAgenda = await apiListAgenda();
                const cita = (resAgenda.success && resAgenda.data ? resAgenda.data : []).find(c => String(c.id) === String(id));
                if (!cita) { alert('No se encontró la cita'); return; }
                const res = await apiCreatePago({ idCita: id, idPaciente: cita.pacienteId, monto: montoFinal });
                if (!res.success) throw new Error(res.message || 'Error al registrar pago');
                window.registrarBitacora('Pagos', 'Registro', `Se registró pago de $${montoFinal} para la cita ID: ${id}.`);
                renderizarTabla();
                ocultarFormulario();
            } catch (e) { console.error(e); alert(e.message || 'Error'); }
        })();
    };
    pagoForm.addEventListener('submit', handleFormSubmit);
    btnCancelarPago.addEventListener('click', ocultarFormulario);
    renderizarTabla();
});