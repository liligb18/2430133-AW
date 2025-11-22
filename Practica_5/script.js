// --- LÓGICA DE VISTAS Y AUTENTICACIÓN ---

let taskIdCounter = 0; 
let isEditingId = null; 

function showLogin() {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('welcome-view').style.display = 'none';
    clearMessages();
}

function showRegister() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'block';
    document.getElementById('welcome-view').style.display = 'none';
    clearMessages();
}

function showWelcome(email) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('welcome-view').style.display = 'block';
    
    // Muestra el mensaje de bienvenida
    document.getElementById('welcomeMessage').textContent = 'Bienvenido(a), ' + email;
    
    // Al iniciar sesión, mostramos la vista de LISTA de tareas por defecto
    showTaskView('list');
}

function clearMessages() {
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').style.display = 'none';
}



function register() {
    clearMessages();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageElement = document.getElementById('registerMessage');

    if (email.trim() === '' || password.trim() === '') {
        messageElement.textContent = 'Por favor, rellena ambos campos.';
        messageElement.classList.remove('success');
        messageElement.classList.add('error');
        messageElement.style.display = 'block';
        return;
    }

    localStorage.setItem('user', JSON.stringify({ email: email, password: password }));
    
    messageElement.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    messageElement.classList.remove('error');
    messageElement.classList.add('success');
    messageElement.style.display = 'block';
    
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    setTimeout(showLogin, 2000); 
}

function login() {
    clearMessages();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');
    
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
        messageElement.textContent = 'Aún no hay usuarios registrados. Regístrate primero.';
        messageElement.style.display = 'block';
        return;
    }

    if (email === storedUser.email && password === storedUser.password) {
        showWelcome(email);
    } else {
        messageElement.textContent = 'Correo o contraseña incorrectos.';
        messageElement.style.display = 'block';
    }
}

function logout() {
    showLogin();
    isEditingId = null;
    document.getElementById('saveTaskBtn').textContent = 'Agregar Tarea';
}




/**
 * Muestra la sub-vista de tareas (lista o crear).
 * @param {string} view - 'list' o 'create'.
 */
function showTaskView(view) {
    // Oculta ambas sub-vistas
    document.getElementById('create-task-view').style.display = 'none';
    document.getElementById('list-task-view').style.display = 'none';
    
    // Resetea el modo edición al cambiar de vista
    isEditingId = null;
    document.getElementById('saveTaskBtn').textContent = 'Agregar Tarea';
    
    // Muestra la vista solicitada
    if (view === 'create') {
        document.getElementById('create-task-view').style.display = 'block';
        // Limpia el formulario al entrar a Crear Tarea
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDetails').value = '';
        document.getElementById('taskDueDate').value = '';
    } else { // 'list'
        document.getElementById('list-task-view').style.display = 'block';
        renderTasks(); // Renderiza la lista cada vez que se abre
    }
}


// --- LÓGICA DE GESTIÓN DE TAREAS ---

function getTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const details = document.getElementById('taskDetails').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title || !dueDate) {
        alert("Por favor, ingresa el título y la fecha de vencimiento de la tarea.");
        return;
    }

    let tasks = getTasks();

    if (isEditingId) {
        // Modo Edición
        tasks = tasks.map(task => {
            if (task.id === isEditingId) {
                return { id: task.id, title: title, details: details, dueDate: dueDate };
            }
            return task;
        });

    } else {
        // Modo Agregar
        taskIdCounter++; 
        const newTask = {
            id: taskIdCounter,
            title: title,
            details: details,
            dueDate: dueDate
        };
        tasks.push(newTask);
    }

    saveTasks(tasks);
    
    // Después de agregar/editar, volvemos a la vista de lista
    showTaskView('list'); 
}

function editTask(taskId) {
    const tasks = getTasks();
    const taskToEdit = tasks.find(task => task.id === taskId);

    if (taskToEdit) {
        // 1. Cambia a la vista de CREAR TAREA
        showTaskView('create'); 
        
        // 2. Carga los datos al formulario
        document.getElementById('taskTitle').value = taskToEdit.title;
        document.getElementById('taskDetails').value = taskToEdit.details;
        document.getElementById('taskDueDate').value = taskToEdit.dueDate;

        // 3. Establece el modo edición
        document.getElementById('saveTaskBtn').textContent = 'Guardar Cambios';
        isEditingId = taskId;
    }
}

function deleteTask(taskId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks(tasks);
        renderTasks();
    }
}

function renderTasks() {
    const taskListElement = document.getElementById('taskList');
    const tasks = getTasks();

    taskListElement.innerHTML = '';

    if (tasks.length === 0) {
        taskListElement.innerHTML = '<p class="no-tasks">Aún no hay tareas asignadas. ¡Crea una!</p>';
        return;
    }
    
    const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
    taskIdCounter = maxId;

    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        // ... (El HTML para mostrar la tarea sigue igual)
        taskDiv.innerHTML = `
            <div class="task-info">
                <h4>${task.title}</h4>
                <p><strong>Detalles:</strong> ${task.details || 'No especificado'}</p>
                <p class="task-due">Vencimiento: ${task.dueDate}</p>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" class="edit-btn">Editar</button>
                <button onclick="deleteTask(${task.id})" class="delete-btn">Eliminar</button>
            </div>
        `;
        taskListElement.appendChild(taskDiv);
    });
}

// Asegura que al cargar la página estemos en la vista de Login
window.onload = showLogin;