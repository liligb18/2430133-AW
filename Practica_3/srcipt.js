document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const alumnoForm = document.getElementById('alumnoForm');
    const tablaAlumnosBody = document.getElementById('tablaAlumnos'); // ID ajustado
    const buscarInput = document.getElementById('buscar');           // ID ajustado

    // El objeto Map se elimina ya que ahora los nombres completos están en el HTML

    // --- Funciones de localStorage ---

    /** Obtiene los alumnos del localStorage, o un array vacío si no hay datos. */
    const obtenerAlumnos = () => {
        const alumnosJson = localStorage.getItem('alumnosUPV');
        try {
            return alumnosJson ? JSON.parse(alumnosJson) : [];
        } catch (e) {
            console.error("Error al parsear alumnos de localStorage:", e);
            return [];
        }
    };

    /** Guarda el array de alumnos en localStorage. */
    const guardarAlumnos = (alumnos) => {
        localStorage.setItem('alumnosUPV', JSON.stringify(alumnos));
    };

    // --- Funciones de Renderizado ---

    /** Muestra los alumnos en la tabla (filtrados o todos) */
    const mostrarAlumnos = (alumnosAMostrar = obtenerAlumnos()) => {
        tablaAlumnosBody.innerHTML = ''; // Limpiar la tabla

        if (alumnosAMostrar.length === 0) {
            tablaAlumnosBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay alumnos registrados.</td></tr>';
            return;
        }

        alumnosAMostrar.forEach(alumno => {
            const fila = tablaAlumnosBody.insertRow();
            
            // Usamos la matrícula como identificador único para las acciones
            const matriculaKey = alumno.matricula;

            fila.innerHTML = `
                <td>${alumno.nombre}</td>
                <td>${alumno.matricula}</td>
                <td>${alumno.carrera}</td>
                <td>${alumno.telefono}</td>
                <td>${alumno.gmail}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white me-2" onclick="alert('Funcionalidad de Edición NO implementada en esta versión rápida.')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${matriculaKey}')">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
        });
    };

    // --- Eventos del Formulario de Registro ---

    /** Maneja el envío del formulario para guardar un nuevo alumno. */
    alumnoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Obtener datos
        const nuevoAlumno = {
            nombre: document.getElementById('nombre').value.trim(),
            matricula: document.getElementById('matricula').value.toUpperCase().trim(),
            carrera: document.getElementById('carrera').value,
            telefono: document.getElementById('telefono').value.trim(),
            gmail: document.getElementById('gmail').value.trim(), // ID ajustado a 'gmail'
        };

        // Validación básica
        if (!nuevoAlumno.matricula || nuevoAlumno.carrera === "") {
            alert('Por favor, complete al menos la Matrícula y la Carrera.');
            return;
        }
        
        const alumnos = obtenerAlumnos();

        // 2. Validar Matrícula (no duplicada)
        const matriculaExistente = alumnos.some(a => a.matricula === nuevoAlumno.matricula);

        if (matriculaExistente) {
            alert(`Error: La matrícula "${nuevoAlumno.matricula}" ya está registrada.`);
            return;
        }

        // 3. Guardar y actualizar
        alumnos.push(nuevoAlumno);
        guardarAlumnos(alumnos);

        // 4. Limpiar formulario y mostrar la tabla
        alumnoForm.reset();
        mostrarAlumnos(); 
        
        alert('Alumno registrado con éxito!');
    });

    // --- Funciones de CRUD (Eliminar) ---

    /** Expone la función de eliminar al alcance global para ser llamada desde el HTML */
    window.eliminarAlumno = (matricula) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al alumno con matrícula ${matricula}?`)) {
            return;
        }

        let alumnos = obtenerAlumnos();
        // Filtrar y dejar solo los alumnos cuya matrícula NO coincida
        alumnos = alumnos.filter(a => a.matricula !== matricula);
        guardarAlumnos(alumnos);
        mostrarAlumnos();
        alert(`Alumno con matrícula ${matricula} eliminado.`);
    };
    
    // --- Funciones de Búsqueda ---
    
    /** Realiza la búsqueda de alumnos por matrícula */
    const buscarAlumnos = () => {
        const termino = buscarInput.value.toUpperCase().trim();
        const alumnos = obtenerAlumnos();
    
        if (termino === '') {
            mostrarAlumnos();
            return;
        }
    
        const resultados = alumnos.filter(alumno =>
            alumno.matricula.toUpperCase().includes(termino)
        );
    
        mostrarAlumnos(resultados);
    };
    
    buscarInput.addEventListener('input', buscarAlumnos); // Búsqueda inmediata al escribir

    // --- Inicialización ---

    // Mostrar los alumnos al cargar la página
    mostrarAlumnos();
});