(function() {
    
    
    window.Validaciones = {
        
        /**
         * Muestra un mensaje de error y detiene la ejecución.
         * @param {string} mensaje -
         */
        mostrarError: (mensaje) => {
            alert(mensaje);
            // Lanza un error para detener la ejecución de la función que lo llamó
            throw new Error(mensaje);
        },

        /**
         * Valida que un campo de texto no esté vacío.
         * @param {string} valor - El valor del campo.
         * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
         * @returns {string}
         */
        validarCampoTexto: (valor, nombreCampo) => {
            const valorTrim = valor.trim();
            if (!valorTrim) {
                Validaciones.mostrarError(`El campo "${nombreCampo}" es obligatorio.`);
            }
            return valorTrim;
        },

        /**
         * Valida un correo electrónico usando una expresión regular simple.
         * @param {string} email - El correo a validar.
         * @returns {string} El email validado.
         */
        validarEmail: (email) => {
            if (!email) return ""; // No es obligatorio
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(String(email).toLowerCase())) {
                Validaciones.mostrarError('El formato del correo electrónico no es válido.');
            }
            return email;
        },

        /**
         * Valida un número de teléfono.
         * @param {string} telefono - El teléfono a validar.
         * @returns {string} El teléfono validado.
         */
        validarTelefono: (telefono) => {
            if (!telefono) return ""; // No es obligatorio
            const re = /^\d{10}$/;
            if (!re.test(telefono)) {
                Validaciones.mostrarError('El teléfono debe contener 10 dígitos numéricos, sin espacios ni guiones.');
            }
            return telefono;
        },

        /**
         * Valida una CURP.
         * @param {string} curp - La CURP a validar.
         * @returns {string} La CURP validada en mayúsculas.
         */
        validarCURP: (curp) => {
            if (!curp) return ""; // No es obligatorio
            const re = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]{2}$/;
            const curpUpper = curp.toUpperCase();
            if (!re.test(curpUpper)) {
                Validaciones.mostrarError('El formato de la CURP no es válido. Debe ser (ej. AAAA000000HAAAAA00).');
            }
            return curpUpper;
        },

        /**
         * Valida que una fecha no sea en el futuro.
         * @param {string} fechaString - La fecha en formato YYYY-MM-DD.
         * @param {string} nombreCampo - El nombre del campo.
         * @returns {string} La fecha validada.
         */
        validarFechaNoFutura: (fechaString, nombreCampo) => {
            if (!fechaString) {
                Validaciones.mostrarError(`El campo "${nombreCampo}" es obligatorio.`);
            }
            const fecha = new Date(fechaString + "T00:00:00"); // Asegura la zona horaria local
            const hoy = new Date();
            hoy.setHours(0,0,0,0); // Resetea la hora actual

            if (fecha > hoy) {
                Validaciones.mostrarError(`El campo "${nombreCampo}" no puede ser una fecha futura.`);
            }
            return fechaString;
        },

        /**
         * Valida que una fecha no sea en el pasado.
         * @param {string} fechaHoraString - La fecha en formato YYYY-MM-DDTHH:MM.
         * @param {string} nombreCampo - El nombre del campo.
         * @returns {string} La fecha validada.
         */
        validarFechaNoPasada: (fechaHoraString, nombreCampo) => {
            if (!fechaHoraString) {
                Validaciones.mostrarError(`El campo "${nombreCampo}" es obligatorio.`);
            }
            const fechaCita = new Date(fechaHoraString);
            const ahora = new Date();

            if (fechaCita < ahora) {
                Validaciones.mostrarError(`El campo "${nombreCampo}" no puede ser una fecha/hora pasada.`);
            }
            return fechaHoraString;
        },

        /**
         * Valida un costo.
         * @param {string|number} costo - El costo.
         * @returns {number} El costo validado como número.
         */
        validarCosto: (costo) => {
            const costoNum = parseFloat(costo);
            if (isNaN(costoNum) || costoNum <= 0) {
                Validaciones.mostrarError('El costo debe ser un número mayor que cero.');
            }
            return costoNum;
        },

        /**
         * Valida la contraseña.
         * @param {string} password - La contraseña.
         * @param {boolean} esNuevo - True si es un usuario nuevo (contraseña obligatoria).
         * @returns {string} La contraseña validada.
         */
        validarPassword: (password, esNuevo) => {
            if (esNuevo && !password) {
                Validaciones.mostrarError('La contraseña es obligatoria para usuarios nuevos.');
            }
            if (password && password.length < 6) {
                Validaciones.mostrarError('La contraseña debe tener al menos 6 caracteres.');
            }
            return password;
        },

        /**
         * Valida la hora de salida sea mayor a la de entrada.
         * @param {string} horaEntrada 
         * @param {string} horaSalida 
         */
        validarHorario: (horaEntrada, horaSalida) => {
            if (!horaEntrada || !horaSalida) {
                Validaciones.mostrarError('La hora de entrada y salida son obligatorias.');
            }
            if (horaSalida <= horaEntrada) {
                Validaciones.mostrarError('La hora de salida debe ser posterior a la hora de entrada.');
            }
        }

    };
})();