// js/auth_guard.js - Protege páginas verificando sesión activa
(function () {
    'use strict';

    // Verificar sesión al cargar la página
    fetch('php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                // No hay sesión activa, redirigir al login con mensaje
                alert('⚠️ Sesión no válida. Debes iniciar sesión para acceder a esta página.');
                window.location.href = 'login.php?error=' + encodeURIComponent('Debes iniciar sesión para acceder.');
            }
        })
        .catch(error => {
            // Error al verificar sesión, redirigir por seguridad
            console.error('Error verificando sesión:', error);
            alert('⚠️ Error al verificar sesión. Serás redirigido al login.');
            window.location.href = 'login.php?error=' + encodeURIComponent('Error al verificar sesión.');
        });
})();
