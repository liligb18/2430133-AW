/* === SCRIPT MÓDULO DE BITÁCORAS === */
document.addEventListener('DOMContentLoaded', () => {

    // --- Bloque de Seguridad ---
    const rolesPermitidos = ['Admin'];
    const userRole = localStorage.getItem('userRole');
    if (!rolesPermitidos.includes(userRole)) {
        alert('Acceso Denegado.');
        window.location.href = 'index.html';
        return;
    }

    // --- Llave de Local Storage ---
    const BITACORAS_KEY = 'bitacoras_db';

    // --- Referencias al DOM ---
    const tablaBitacorasBody = document.getElementById('tabla-bitacoras-body');
    const btnLimpiarBitacora = document.getElementById('btn-limpiar-bitacora');

    // --- Funciones Helper ---
    const getBitacoras = () => JSON.parse(localStorage.getItem(BITACORAS_KEY) || '[]');
    const saveBitacoras = (data) => localStorage.setItem(BITACORAS_KEY, JSON.stringify(data));

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            const fecha = new Date(fechaString);
            const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            return fecha.toLocaleString('es-MX', opciones);
        } catch (e) { return fechaString; }
    };

    // --- Lógica del Módulo ---
    const renderizarTabla = () => {
        const bitacoras = getBitacoras();
        // Ordenamos en reverso (más reciente primero)
        bitacoras.reverse(); 
        
        tablaBitacorasBody.innerHTML = '';
        if (bitacoras.length === 0) {
            tablaBitacorasBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros en la bitácora.</td></tr>';
            return;
        }

        bitacoras.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFecha(log.fecha)}</td>
                <td>${log.usuario}</td>
                <td>${log.modulo}</td>
                <td>${log.accion}</td>
                <td>${log.detalle}</td>
            `;
            tablaBitacorasBody.appendChild(tr);
        });
    };

    const limpiarBitacora = () => {
        if (!confirm('¿Estás seguro de que deseas limpiar TODA la bitácora? Esta acción no se puede deshacer.')) {
            return;
        }
        saveBitacoras([]); // Guardamos un array vacío
        renderizarTabla();
        window.registrarBitacora('Bitácora', 'Limpieza', 'Se limpió el registro de bitácora.');
    };

    // --- Eventos ---
    btnLimpiarBitacora.addEventListener('click', limpiarBitacora);

    // --- Carga Inicial ---
    renderizarTabla();
});