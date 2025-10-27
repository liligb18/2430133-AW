document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');

    // --- Simulación de Bienvenida Personalizada ---
    // NOTA: En un proyecto real, obtendrías el nombre/correo del usuario de una cookie o del almacenamiento local
    // que se guardó durante el login. Aquí, usaremos un nombre de ejemplo.
    const userName = "Usuario Prueba"; 
    welcomeMessage.textContent = `¡Hola de nuevo, ${userName}!`;


    // --- Lógica de Cerrar Sesión ---
    logoutButton.addEventListener('click', () => {
        const confirmLogout = confirm("¿Estás seguro de que quieres cerrar tu sesión?");
        
        if (confirmLogout) {
            // Aquí iría la lógica para limpiar tokens, cookies o almacenamiento local
            console.log("Sesión cerrada.");
            
            // Redirigir de vuelta a la página de login
            window.location.href = 'login.html'; 
        }
    });
});