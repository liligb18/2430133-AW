document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Verificación de Autenticación---
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole'); // Obtenemos el ROL

    // Si no ha iniciado sesión, lo sacamos
    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = 'login.html';
        return; 
    }


    // --- 2. Cerrar Sesión ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            // Limpiamos las llaves de sesión
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }



    // Esta función oculta los botones del menú según el rol.
    const gestionarVisibilidadMenu = (rol) => {
     
        
        const menuMedicos = document.getElementById('menu-medicos');
        const menuEspecialidades = document.getElementById('menu-especialidades');
        const menuPagos = document.getElementById('menu-pagos');
        const menuReportes = document.getElementById('menu-reportes');
        const menuTarifas = document.getElementById('menu-tarifas');
        const menuBitacoras = document.getElementById('menu-bitacoras');

        // Ocultamos
        if (menuMedicos) menuMedicos.style.display = 'none';
        if (menuEspecialidades) menuEspecialidades.style.display = 'none';
        if (menuPagos) menuPagos.style.display = 'none';
        if (menuReportes) menuReportes.style.display = 'none';
        if (menuTarifas) menuTarifas.style.display = 'none';
        if (menuBitacoras) menuBitacoras.style.display = 'none';

        // Lógica de permisos
        if (rol === 'Admin') {
            // El Admin puede ver todo
            if (menuMedicos) menuMedicos.style.display = 'block';
            if (menuEspecialidades) menuEspecialidades.style.display = 'block';
            if (menuPagos) menuPagos.style.display = 'block';
            if (menuReportes) menuReportes.style.display = 'block';
            if (menuTarifas) menuTarifas.style.display = 'block';
            if (menuBitacoras) menuBitacoras.style.display = 'block';
        
        } else if (rol === 'Recepcionista') {
            // Recepción puede ver Pacientes, Agenda y Pagos
            if (menuPagos) menuPagos.style.display = 'block';
            // Los demás quedan ocultos
        
        } else if (rol === 'Medico') {
            // El Médico solo ve módulos clínicos (Pacientes, Agenda)
        }
    };

    gestionarVisibilidadMenu(userRole);

});