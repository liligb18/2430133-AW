// --- 1. DATOS INICIALES (Simulación de Base de Datos) ---

const UPV_CARRERAS = [
    "Ingeniería en Tecnologías de la Información",
    "Ingeniería en Mecatrónica",
    "Ingeniería en Energía",
    "Licenciatura en Administración y Gestión de PYMES"
];

// Función para obtener datos de LocalStorage o inicializarlos
function getDB(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function saveDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

let tasks = getDB('tasks');
let currentUser = null; // Almacena el usuario que ha iniciado sesión

// --- 2. GESTIÓN DE VISTAS ---

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function renderApp() {
    if (currentUser) {
        showView('main-app-view');
        renderMenu();
        loadContent('principal');
    } else {
        showView('auth-view');
    }
}

// Genera los campos del formulario de registro según el rol
document.getElementById('register-role').addEventListener('change', (e) => {
    const role = e.target.value;
    const roleFields = document.getElementById('role-fields');
    roleFields.innerHTML = ''; // Limpiar campos

    if (!role) return;

    // Se recomienda usar la etiqueta <label> en el HTML en lugar de confiar solo en el placeholder
    let html = `
        <input type="text" id="register-nombre" placeholder="Nombre Completo" required>
        <input type="text" id="register-telefono" placeholder="Teléfono" required>
        <input type="email" id="register-correo" placeholder="Correo Electrónico" required>
    `;

    if (role === 'maestro') {
        html += `<input type="text" id="register-materia" placeholder="Materia que Imparte" required>`;
    } else if (role === 'alumno') {
        html += `<input type="text" id="register-matricula" placeholder="Matrícula" required>`;
        html += `<select id="register-carrera" required>
                    <option value="">Selecciona tu Carrera</option>
                    ${UPV_CARRERAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                 </select>`;
    }

    roleFields.innerHTML = html;
});

// --- 3. AUTENTICACIÓN (LOGIN y REGISTRO) ---

function handleRegister() {
    const role = document.getElementById('register-role').value;
    // Limpieza de espacios con .trim()
    const username = document.getElementById('register-new-username').value.trim();
    const password = document.getElementById('register-new-password').value.trim();
    const nombre = document.getElementById('register-nombre')?.value;
    const telefono = document.getElementById('register-telefono')?.value;
    const correo = document.getElementById('register-correo')?.value;

    if (!role || !username || !password || !nombre) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    if (users.find(u => u.username === username)) {
        alert('Ese nombre de usuario ya existe.');
        return;
    }

    let newUser = { role, nombre, telefono, correo, username, password };

    if (role === 'maestro') {
        newUser.materia = document.getElementById('register-materia').value;
    } else if (role === 'alumno') {
        newUser.matricula = document.getElementById('register-matricula').value;
        newUser.carrera = document.getElementById('register-carrera').value;
    }

    users.push(newUser);
    saveDB('users', users);
    alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');

    // Volver a la vista de login
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

function handleLogin() {
    // Limpieza de espacios con .trim()
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // La búsqueda se realiza con los valores limpios
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        // Limpiar campos después de iniciar sesión exitosamente
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        renderApp();
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

function logout() {
    currentUser = null;
    renderApp();
    alert('Has cerrado sesión.');
}


// --- 4. NAVEGACIÓN Y APARTADOS ---

const SECTIONS = [
    { id: 'principal', name: 'Menú Principal', roles: ['maestro', 'alumno'], func: renderPrincipal },
    { id: 'dashboard', name: 'Dashboard', roles: ['maestro', 'alumno'], func: renderDashboard },
    { id: 'gestion-usuarios', name: 'Gestión de Usuarios', roles: ['maestro'], func: renderGestionUsuarios },
    { id: 'gestion-tareas', name: 'Gestión de Tareas', roles: ['maestro'], func: renderGestionTareas },
    { id: 'reportes', name: 'Reportes', roles: ['maestro'], func: renderReportes }
];

function renderMenu() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = '';
    const availableSections = SECTIONS.filter(sec => sec.roles.includes(currentUser.role));

    availableSections.forEach(sec => {
        const btn = document.createElement('button');
        btn.textContent = sec.name;
        btn.onclick = () => loadContent(sec.id);
        nav.appendChild(btn);
    });
}

function loadContent(sectionId) {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;
    
    // Ejecutar la función de renderizado del contenido
    section.func();
}


// --- 5. RENDERIZADO DE CONTENIDOS POR SECCIÓN ---

// 5.1. Menú Principal
function renderPrincipal() {
    document.getElementById('content-area').innerHTML = `
        <h2>Bienvenido(a), ${currentUser.nombre}</h2>
        
    `;
}

// 5.2. Dashboard
function renderDashboard() {
    const dashboardArea = document.getElementById('content-area');
    const totalUsers = users.length;
    const totalTeachers = users.filter(u => u.role === 'maestro').length;
    const totalStudents = totalUsers - totalTeachers;
    const totalTasks = tasks.length;

    dashboardArea.innerHTML = `
        <h2>Dashboard General</h2>
        <div style="display: flex; gap: 20px;">
            <div style="padding: 15px; border: 1px solid #ccc; flex-grow: 1;">
                <h3>Usuarios Totales</h3>
                <p style="font-size: 2em; color: #1a73e8;">${totalUsers}</p>
            </div>
            <div style="padding: 15px; border: 1px solid #ccc; flex-grow: 1;">
                <h3>Tareas Publicadas</h3>
                <p style="font-size: 2em; color: #e8a31a;">${totalTasks}</p>
            </div>
            <div style="padding: 15px; border: 1px solid #ccc; flex-grow: 1;">
                <h3>Alumnos Registrados</h3>
                <p style="font-size: 2em; color: #34a853;">${totalStudents}</p>
            </div>
        </div>
        
        <h3>Tareas Pendientes</h3>
        <ul id="task-list">
            ${tasks.map(t => 
                `<li>**${t.title}** (Materia: ${t.subject}) - Fecha Límite: ${t.dueDate}</li>`
            ).join('') || `<p>No hay tareas publicadas aún.</p>`}
        </ul>
    `;
}

// 5.3. Gestión de Usuarios (SOLO MAESTROS)
function renderGestionUsuarios() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h2>Gestión de Usuarios</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rol</th>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Detalle</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="users-table-body">
                ${users.map((u, index) => `
                    <tr>
                        <td>${u.role}</td>
                        <td>${u.nombre}</td>
                        <td>${u.username}</td>
                        <td>${u.role === 'maestro' ? `Materia: ${u.materia}` : `Matrícula: ${u.matricula}, Carrera: ${u.carrera}`}</td>
                        <td>
                            <button onclick="editUser(${index})">Editar</button>
                            <button onclick="deleteUser(${index})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function deleteUser(index) {
    if (confirm(`¿Estás seguro de eliminar a ${users[index].nombre}?`)) {
        users.splice(index, 1);
        saveDB('users', users);
        renderGestionUsuarios(); // Recargar la vista
    }
}

function editUser(index) {
    const user = users[index];
    const newName = prompt(`Editar nombre de ${user.nombre}:`, user.nombre);
    if (newName !== null) {
        user.nombre = newName;
        saveDB('users', users);
        renderGestionUsuarios();
        alert('Usuario editado con éxito.');
    }
    // NOTA: Para un sistema real, se usaría un modal/formulario complejo. Aquí usamos prompt para simplificar.
}

// 5.4. Gestión de Tareas (SOLO MAESTROS)
function renderGestionTareas() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h2>Publicar Nueva Tarea</h2>
        <div class="form-container">
            <input type="text" id="task-title" placeholder="Título de la Tarea" required>
            <input type="text" id="task-subject" placeholder="Materia (ej: Programación Web)" required>
            <textarea id="task-description" placeholder="Descripción de la Tarea" required></textarea>
            <input type="date" id="task-due-date" required>
            <button onclick="publishTask()">Publicar Tarea</button>
        </div>

        <h3>Tareas Publicadas</h3>
        <ul id="published-tasks">
            ${tasks.map((t, index) => 
                `<li>**${t.title}** (${t.subject}) - Límite: ${t.dueDate} 
                 <button onclick="deleteTask(${index})">Eliminar</button></li>`
            ).join('') || `<p>Aún no has publicado ninguna tarea.</p>`}
        </ul>
    `;
}

function publishTask() {
    const title = document.getElementById('task-title').value;
    const subject = document.getElementById('task-subject').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;

    if (!title || !subject || !description || !dueDate) {
        alert('Debes completar todos los campos de la tarea.');
        return;
    }

    const newTask = {
        title,
        subject,
        description,
        dueDate,
        publisher: currentUser.username
    };

    tasks.push(newTask);
    saveDB('tasks', tasks);
    alert('Tarea publicada con éxito.');
    renderGestionTareas();
}

function deleteTask(index) {
    if (confirm(`¿Estás seguro de eliminar la tarea "${tasks[index].title}"?`)) {
        tasks.splice(index, 1);
        saveDB('tasks', tasks);
        renderGestionTareas();
    }
}


// 5.5. Reportes (SOLO MAESTROS)
function renderReportes() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h2>Reportes del Sistema</h2>
        <p>Aquí se visualizarían informes detallados. (Funcionalidad simplificada).</p>
        
        <h3>Maestros por Materia</h3>
        <table class="data-table">
            <thead><tr><th>Maestro</th><th>Materia</th></tr></thead>
            <tbody>
                ${users.filter(u => u.role === 'maestro').map(m => 
                    `<tr><td>${m.nombre}</td><td>${m.materia}</td></tr>`
                ).join('')}
            </tbody>
        </table>

        <h3>Alumnos por Carrera</h3>
        <table class="data-table">
            <thead><tr><th>Carrera</th><th># Alumnos</th></tr></thead>
            <tbody>
                ${UPV_CARRERAS.map(carrera => {
                    const count = users.filter(u => u.role === 'alumno' && u.carrera === carrera).length;
                    return `<tr><td>${carrera}</td><td>${count}</td></tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Manejo de botones de la vista de autenticación
    document.getElementById('show-login-btn').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    document.getElementById('show-register-btn').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    renderApp(); // Iniciar la aplicación en la vista de autenticación
});