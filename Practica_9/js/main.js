document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Verificación de Autenticación ---
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = 'login.html';
        return; 
    }

    // --- 2. Cerrar Sesión  ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            // Registramos el logout ANTES de borrar los datos
            window.registrarBitacora('Login', 'Cierre de Sesión', `Usuario ${localStorage.getItem('username')} cerró sesión.`);

            // Limpiamos TODAS las llaves de sesión
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('medicoId');
            
            window.location.href = 'login.html';
        });
    }

    // --- 3. Visibilidad del Menú por Rol ---
    const gestionarVisibilidadMenu = (rol) => {
        const menuUsuarios = document.getElementById('menu-usuarios');
        const menuMedicos = document.getElementById('menu-medicos');
        const menuEspecialidades = document.getElementById('menu-especialidades');
        const menuPagos = document.getElementById('menu-pagos');
        const menuReportes = document.getElementById('menu-reportes');
        const menuTarifas = document.getElementById('menu-tarifas');
        const menuBitacoras = document.getElementById('menu-bitacoras');
        
        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuMedicos) menuMedicos.style.display = 'none';
        if (menuEspecialidades) menuEspecialidades.style.display = 'none';
        if (menuPagos) menuPagos.style.display = 'none';
        if (menuReportes) menuReportes.style.display = 'none';
        if (menuTarifas) menuTarifas.style.display = 'none';
        if (menuBitacoras) menuBitacoras.style.display = 'none';

        if (rol === 'Admin') {
            if (menuUsuarios) menuUsuarios.style.display = 'block';
            if (menuMedicos) menuMedicos.style.display = 'block';
            if (menuEspecialidades) menuEspecialidades.style.display = 'block';
            if (menuPagos) menuPagos.style.display = 'block';
            if (menuReportes) menuReportes.style.display = 'block';
            if (menuTarifas) menuTarifas.style.display = 'block';
            if (menuBitacoras) menuBitacoras.style.display = 'block';
        
        } else if (rol === 'Recepcionista') {
            if (menuPagos) menuPagos.style.display = 'block';
        
        } else if (rol === 'Medico') {
            
        }
    };

    gestionarVisibilidadMenu(userRole);

    // --- 4. Restricciones de fecha/hora en inputs (para evitar fechas futuras/pasadas por cliente) ---
    const setDateTimeConstraints = () => {
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(i => i.max = todayDate);

        // Para datetime-local, establecer mínimo a ahora (redondeado al minuto)
        document.querySelectorAll('input[type="datetime-local"]').forEach(i => {
            const pad = (n) => String(n).padStart(2, '0');
            const y = now.getFullYear();
            const m = pad(now.getMonth() + 1);
            const d = pad(now.getDate());
            const hh = pad(now.getHours());
            const mm = pad(now.getMinutes());
            i.min = `${y}-${m}-${d}T${hh}:${mm}`;
        });
    };
    setDateTimeConstraints();
    // --- 5. CSRF token loader para AJAX ---
    // Proporciona window.getCsrfToken() que devuelve una promesa resuelta con el token (o null)
    (function(){
        window._csrfPromise = null;
        window.getCsrfToken = function() {
            if (window._csrfPromise) return window._csrfPromise;
            const authHeaders = () => ({ 'X-Local-Auth': (localStorage.getItem('isAuthenticated') === 'true') ? '1' : '0', 'X-User-Role': localStorage.getItem('userRole') || '' });
            window._csrfPromise = fetch('php/api/csrf.php', { method: 'GET', credentials: 'same-origin', headers: authHeaders() })
                .then(res => res.json())
                .then(json => json && json.success ? json.csrf_token : null)
                .catch(() => null);
            // Propagar el token a window.CSRF_TOKEN cuando esté disponible
            window._csrfPromise.then(t => { window.CSRF_TOKEN = t; });
            return window._csrfPromise;
        };
        // Iniciar la carga en background
        window.getCsrfToken();
    })();
});


// --- 4. FUNCIÓN GLOBAL DE BITÁCORA ---
// La definimos fuera del 'DOMContentLoaded' para hacerla global
const BITACORAS_KEY = 'bitacoras_db';
const MAX_BITACORAS = 100; // Límite de registros en bitácora

/**
 * @param {string} modulo - Módulo que origina la acción.
 * @param {string} accion - Acción realizada.
 * @param {string} detalle - Detalle.
 */
window.registrarBitacora = (modulo, accion, detalle) => {
    try {
        const usuario = localStorage.getItem('username') || 'Sistema';
        const dataJSON = localStorage.getItem(BITACORAS_KEY);
        let bitacoras = dataJSON ? JSON.parse(dataJSON) : [];

        const nuevoRegistro = {
            id: `bit_${Date.now()}`,
            fecha: new Date().toISOString(),
            usuario: usuario,
            modulo: modulo,
            accion: accion,
            detalle: detalle
        };

        // Añadimos el nuevo registro
        bitacoras.push(nuevoRegistro);

        // Mantenemos solo los últimos MAX_BITACORAS registros
        if (bitacoras.length > MAX_BITACORAS) {
            bitacoras = bitacoras.slice(bitacoras.length - MAX_BITACORAS);
        }

        // Guardamos
        localStorage.setItem(BITACORAS_KEY, JSON.stringify(bitacoras));

    } catch (error) {
        console.error("Error al registrar en bitácora:", error);
    }
};