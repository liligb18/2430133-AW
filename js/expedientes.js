document.addEventListener('DOMContentLoaded', () => {
    const rolesPermitidos = ['Admin', 'Medico'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) { alert('Acceso Denegado'); window.location.href = 'index.html'; return; }

    const API_EXP = 'php/api/expedientes.php';
    const API_PAC = 'php/api/pacientes.php';
    const API_MED = 'php/api/medicos.php';
    const tabla = document.getElementById('tabla-expedientes-body');
    const form = document.getElementById('form-expediente');
    const fid = document.getElementById('expediente-id');
    const fpac = document.getElementById('exp-paciente');
    const fmed = document.getElementById('exp-medico');

    // Nuevos campos
    const fdx = document.getElementById('exp-diagnostico'); // Antes titulo
    const ftx = document.getElementById('exp-tratamiento'); // Antes detalle
    const fnotas = document.getElementById('exp-notas'); // Nuevo

    // Ajustar IDs en HTML si es necesario o mapear aquí
    // Nota: El HTML original tenía 'exp-titulo' y 'exp-detalle'. 
    // Asumiremos que el usuario actualizará el HTML o que debemos usar los IDs existentes mapeados a los nuevos conceptos.
    // Para evitar romper el HTML sin editarlo, usaremos los elementos existentes con nuevos propósitos visuales si es posible,
    // pero lo ideal es que el HTML refleje la realidad.
    // Dado que no puedo editar HTML en este paso sin verlo, asumiré que debo adaptar el JS a los IDs existentes
    // O mejor, usaré selectores flexibles o actualizaré el HTML también.
    // Vamos a asumir que 'exp-titulo' -> Diagnóstico y 'exp-detalle' -> Tratamiento.

    const ftit = document.getElementById('exp-titulo'); // Usaremos este para Diagnóstico
    const fdet = document.getElementById('exp-detalle'); // Usaremos este para Tratamiento

    // Cambiar labels visualmente si es posible
    if (ftit) ftit.previousElementSibling.textContent = 'Diagnóstico:';
    if (fdet) fdet.previousElementSibling.textContent = 'Tratamiento:';

    const btnNuevo = document.getElementById('btn-nuevo-expediente');
    const btnCancel = document.getElementById('btn-cancelar');

    const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });
    const postForm = (data) => (async () => { const token = await window.getCsrfToken(); const payload = Object.assign({}, data, token ? { csrf_token: token } : {}); const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, authHeaders()); return fetch(API_EXP, { method: 'POST', headers: headers, body: new URLSearchParams(payload), credentials: 'same-origin' }).then(r => r.json()); })();
    const apiList = () => fetch(API_EXP, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListPac = () => fetch(API_PAC, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());
    const apiListMed = () => fetch(API_MED, { credentials: 'same-origin', headers: authHeaders() }).then(r => r.json());

    const cargar = async () => {
        fpac.innerHTML = '<option value="">Cargando...</option>'; fmed.innerHTML = '<option value="">Cargando...</option>';
        try {
            const [rp, rm] = await Promise.all([apiListPac(), apiListMed()]);
            fpac.innerHTML = '<option value="">Seleccione...</option>'; fmed.innerHTML = '<option value="">Seleccione...</option>';
            (rp.data || []).forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = p.nombre; fpac.appendChild(o); });
            (rm.data || []).forEach(m => { const o = document.createElement('option'); o.value = m.id; o.textContent = m.nombre; fmed.appendChild(o); });
        } catch (e) { console.error(e); }
    };

    const render = async () => {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center">Cargando...</td></tr>';
        try {
            const res = await apiList();
            const pacs = (await apiListPac()).data || [];
            const meds = (await apiListMed()).data || [];
            const rows = (res.success && res.data) ? res.data : [];
            tabla.innerHTML = '';
            rows.forEach(r => {
                const pac = pacs.find(p => String(p.id) === String(r.pacienteId));
                const med = meds.find(m => String(m.id) === String(r.medicoId));
                const tr = document.createElement('tr');
                // Mostramos Diagnóstico en lugar de Título
                tr.innerHTML = `<td>${r.fecha}</td><td>${pac ? pac.nombre : 'N/A'}</td><td>${med ? med.nombre : 'N/A'}</td><td>${r.diagnostico}</td><td class="actions-cell"><button class="btn btn-edit btn-editar-exp" data-id="${r.id}"><i class="fas fa-edit"></i></button> <button class="btn btn-danger btn-eliminar-exp" data-id="${r.id}"><i class="fas fa-trash"></i></button></td>`;
                tabla.appendChild(tr);
            });
            document.querySelectorAll('.btn-editar-exp').forEach(b => b.addEventListener('click', async e => {
                const id = e.currentTarget.dataset.id;
                const res = await apiList();
                const data = (res.data || []).find(x => String(x.id) === String(id));
                if (!data) return;
                fid.value = data.id;
                fpac.value = data.pacienteId;
                fmed.value = data.medicoId;
                ftit.value = data.diagnostico; // Mapeo
                fdet.value = data.tratamiento; // Mapeo
                document.getElementById('form-container-expediente').style.display = 'block';
            }));
            document.querySelectorAll('.btn-eliminar-exp').forEach(b => b.addEventListener('click', async e => { if (!confirm('Eliminar registro?')) return; const id = e.currentTarget.dataset.id; try { const r = await postForm({ action: 'delete', id }); if (!r.success) throw new Error(r.message || 'Error'); render(); } catch (er) { console.error(er); try { Validaciones.mostrarError(er.message || 'Error'); } catch (_) { } } }));
        } catch (e) { console.error(e); tabla.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Error</td></tr>'; }
    };

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
            const id = fid.value;
            const pacienteId = fpac.value;
            const medicoId = fmed.value;
            const diagnostico = ftit.value.trim(); // Mapeo
            const tratamiento = fdet.value.trim(); // Mapeo

            if (!pacienteId || !medicoId) Validaciones.mostrarError('Paciente y médico requeridos');

            let res;
            if (id) res = await postForm({ action: 'update', id, diagnostico, tratamiento });
            else res = await postForm({ action: 'create', pacienteId, medicoId, diagnostico, tratamiento });

            if (!res.success) throw new Error(res.message || 'Error');
            document.getElementById('form-container-expediente').style.display = 'none';
            form.reset();
            render();
        } catch (e) {
            console.error(e);
            try { Validaciones.mostrarError(e.message || 'Error'); } catch (_) { }
        }
    });

    btnNuevo.addEventListener('click', () => { fid.value = ''; form.reset(); cargar(); document.getElementById('form-container-expediente').style.display = 'block'; });
    btnCancel.addEventListener('click', () => { document.getElementById('form-container-expediente').style.display = 'none'; form.reset(); });

    cargar(); render();
});
