/* === SCRIPT GLOBAL === */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Verificación de Autenticación (¿Quién eres?) ---
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole'); // Obtenemos el ROL

    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = 'login.html';
        return; 
    }

    // --- 2. Funcionalidad de Cerrar Sesión (Logout) ---
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

    // --- 3. Gestión de Visibilidad del Menú por Rol ---
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
            // (Ya ve Pacientes y Agenda por defecto)
        }
    };

    gestionarVisibilidadMenu(userRole);
});


// --- 4. ¡NUEVO! FUNCIÓN GLOBAL DE BITÁCORA ---
// La definimos fuera del 'DOMContentLoaded' para hacerla global
const BITACORAS_KEY = 'bitacoras_db';
const MAX_BITACORAS = 100; // Límite de registros en bitácora

/**
 * Registra una acción en la bitácora global de LocalStorage.
 * @param {string} modulo - Módulo que origina la acción (Ej. "Pacientes", "Login").
 * @param {string} accion - Acción realizada (Ej. "Creación", "Eliminación").
 * @param {string} detalle - Detalle del evento (Ej. "Se creó al paciente Juan Pérez").
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