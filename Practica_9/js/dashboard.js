/* === SCRIPT MÓDULO DE DASHBOARD === */
document.addEventListener('DOMContentLoaded', () => {

    // --- ¡NUEVO! Bloque de Seguridad por Rol ---
    // Definimos qué roles pueden ver esta página
    const rolesPermitidos = ['Admin', 'Recepcionista', 'Medico'];
    const userRole = localStorage.getItem('userRole');

    if (!rolesPermitidos.includes(userRole)) {
        // Si el rol del usuario NO está en la lista
        alert('Acceso Denegado. No tienes permisos para ver esta página.');
        window.location.href = 'index.html'; // Lo mandamos al inicio (o login)
        return; // Detenemos la ejecución
    }
    // --- Fin del Bloque de Seguridad ---


    // --- 1. Definición de llaves de Local Storage ---
    const PACIENTES_KEY = 'pacientes_db';
    const MEDICOS_KEY = 'medicos_db';
    const AGENDA_KEY = 'agenda_db';
    const USERNAME_KEY = 'username';

    // ... (El resto del archivo sigue igual que antes) ...
    // --- 2. Referencias a Elementos del DOM ---
    const statPacientesEl = document.getElementById('stat-pacientes');
    const statCitasHoyEl = document.getElementById('stat-citas-hoy');
    const statMedicosEl = document.getElementById('stat-medicos');
    const welcomeMessageEl = document.getElementById('welcome-message');

    // --- 3. Funciones "Get" para leer Local Storage ---
    const getData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    // --- 4. Funciones de Cómputo ---
    const actualizarConteoPacientes = () => {
        const pacientes = getData(PACIENTES_KEY);
        statPacientesEl.textContent = pacientes.length;
    };

    const actualizarConteoMedicos = () => {
        const medicos = getData(MEDICOS_KEY);
        statMedicosEl.textContent = medicos.length;
    };

    const actualizarConteoCitasHoy = () => {
        const citas = getData(AGENDA_KEY);
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0'); 
        const dia = String(hoy.getDate()).padStart(2, '0');
        const hoyString = `${anio}-${mes}-${dia}`; 

        const citasDeHoy = citas.filter(cita => {
            if (!cita.fecha) return false;
            const fechaDeLaCita = cita.fecha.split('T')[0];
            return fechaDeLaCita === hoyString;
        });
        statCitasHoyEl.textContent = citasDeHoy.length;
    };

    const actualizarMensajeBienvenida = () => {
        const username = localStorage.getItem(USERNAME_KEY);
        if (username) {
            welcomeMessageEl.textContent = `Bienvenido de vuelta, ${username} (Rol: ${userRole}).`;
        }
    };

    // --- 5. Ejecución ---
    actualizarConteoPacientes();
    actualizarConteoMedicos();
    actualizarConteoCitasHoy();
    actualizarMensajeBienvenida();
});