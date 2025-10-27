// Esta función crea los campos de entrada
function generarInputs() {
    const numMaterias = document.getElementById('numMaterias').value;
    const container = document.getElementById('materias-container');
    
    // Limpia el contenedor
    container.innerHTML = '';
    
    let htmlString = '';
    
    // Crea el HTML para cada materia
    for (let i = 1; i <= numMaterias; i++) {
        htmlString += '<div class="materia-grupo">';
        htmlString += '<h3>Materia ' + i + '</h3>';
        htmlString += '<div class="unidades-inputs">';
        
        // Crea 4 campos de calificación
        for (let j = 1; j <= 4; j++) {
            htmlString += '<label>Unidad ' + j + ':</label>';
            // Usa una clase para poder encontrarlos después
            htmlString += '<input type="number" class="calificacion-unidad" placeholder="Calificación">';
        }
        
        htmlString += '</div>'; // Cierra .unidades-inputs
        htmlString += '</div>'; // Cierra .materia-grupo
    }
    
    // Pone el HTML en la página
    container.innerHTML = htmlString;
    
    // Muestra el botón de calcular
    document.getElementById('calcularBtn').style.display = 'block';
    
    // Limpia resultados anteriores
    document.getElementById('resultados-container').innerHTML = '<h2>Resultados por Materia</h2>';
}

// calcula los promedios
function calcularCalificaciones() {
    
    // Busca todos los grupos de materias que se crearon
    const materias = document.querySelectorAll('.materia-grupo');
    const resultadosContainer = document.getElementById('resultados-container');
    
    // Limpia los resultados
    resultadosContainer.innerHTML = '<h2>Resultados por Materia</h2>';

    // Recorre cada materia
    for (let i = 0; i < materias.length; i++) {
        
        let materiaActual = materias[i];
        
        // Busca los 4 inputs de esta materia
        const inputs = materiaActual.querySelectorAll('.calificacion-unidad');
        
        let suma = 0;

        // Recorre los 4 inputs
        for (let j = 0; j < inputs.length; j++) {
            // Suma el valor (convierte a número, o usa 0 si está vacío)
            suma = suma + (parseFloat(inputs[j].value) || 0);
        }

        let promedioFinal = suma / 4; 
        
        let estado;
        let claseCss;

        
        if (promedioFinal < 70) {
            estado = "No Aprobado";
            claseCss = "no-aprobado";
        } else {
            estado = "Aprobado";
            claseCss = "aprobado";
        }
        
       -

        
        
    
        let resultadoHtml = '<div class="resultado-item ' + claseCss + '">';
        resultadoHtml += '<h4>Materia ' + (i + 1) + '</h4>';
        // Muestra el promedio
        resultadoHtml += '<p>Promedio Final: <strong>' + promedioFinal.toFixed(2) + '</strong></p>'; 
        resultadoHtml += '<p>Estado: <strong>' + estado + '</strong></p>';
        resultadoHtml += '</div>';
        
        resultadosContainer.innerHTML += resultadoHtml;
    }
}