// --- VARIABLES GLOBALES DE ESTADO ---
let loggedInUserEmail = null;
let currentProjectId = null; // ID del proyecto que estamos viendo
let taskIdCounter = 0; 
let projectIdCounter = 0;
let isEditingProjectId = null;
let isEditingTaskId = null;

// Variables para Drag & Drop
let dragSrcElId = null; 

// Referencias a los contenedores Kanban
let statusContainers = {};


// --- LÓGICA DE UTILIDAD Y DATOS ---

function getProjects() {
    const projectsJSON = localStorage.getItem('projects');
    return projectsJSON ? JSON.parse(projectsJSON) : [];
}

function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function getTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getUsers() {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function clearMessages() {
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').style.display = 'none';
}


// --- LÓGICA DE AUTENTICACIÓN Y VISTAS PRINCIPALES ---

function showView(viewId) {
    const views = ['login-view', 'register-view', 'welcome-view'];
    views.forEach(id => {
        document.getElementById(id).style.display = id === viewId ? 'block' : 'none';
    });
}

function showLogin() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
    loggedInUserEmail = null;
    currentProjectId = null;
    showView('login-view');
    clearMessages();
}

function showRegister() {
    showView('register-view');
    clearMessages();
}

function showWelcome(email) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserEmail', email);
    loggedInUserEmail = email;

    document.getElementById('welcomeMessage').textContent = 'Bienvenido(a), ' + email;
    showView('welcome-view');
    
    // Al iniciar sesión, siempre vamos a la lista de proyectos
    showProjectsList();
}

function checkSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('currentUserEmail');
    
    if (isLoggedIn === 'true' && email) {
        showWelcome(email);
    } else {
        showLogin();
    }
}

function register() {
    clearMessages();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageElement = document.getElementById('registerMessage');

    if (email.trim() === '' || password.trim() === '') {
        messageElement.textContent = 'Por favor, rellena ambos campos.';
        messageElement.classList.add('error');
        messageElement.style.display = 'block';
        return;
    }

    let users = getUsers();
    if (users.find(u => u.email === email)) {
        messageElement.textContent = 'Este correo ya está registrado.';
        messageElement.classList.add('error');
        messageElement.style.display = 'block';
        return;
    }

    users.push({ email: email, password: password });
    saveUsers(users);
    
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
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        showWelcome(email);
    } else {
        messageElement.textContent = 'Correo o contraseña incorrectos.';
        messageElement.style.display = 'block';
    }
}

function logout() {
    showLogin();
}

// --- LÓGICA DE PROYECTOS ---

function showDashboardView(viewId) {
    const views = ['list-projects-view', 'create-project-view', 'project-tasks-view'];
    views.forEach(id => {
        document.getElementById(id).style.display = id === viewId ? 'block' : 'none';
    });
}

function showProjectsList() {
    showDashboardView('list-projects-view');
    renderProjects();
}

function showCreateProject() {
    isEditingProjectId = null;
    document.getElementById('projectFormTitle').textContent = 'Crear Nuevo Proyecto';
    document.getElementById('projectName').value = '';
    document.getElementById('projectStatus').value = 'En Espera';
    document.getElementById('projectStartDate').value = '';
    document.getElementById('projectEndDate').value = '';
    document.getElementById('saveProjectBtn').textContent = 'Guardar Proyecto';
    showDashboardView('create-project-view');
}

function saveProject() {
    const name = document.getElementById('projectName').value.trim();
    const status = document.getElementById('projectStatus').value;
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;

    if (!name || !startDate || !endDate) {
        alert("Por favor, rellena el nombre y las fechas del proyecto.");
        return;
    }

    let projects = getProjects();

    if (isEditingProjectId) {
        projects = projects.map(p => {
            if (p.id === isEditingProjectId) {
                p.nombre = name;
                p.estado = status;
                p.fecha_inicio = startDate;
                p.fecha_fin = endDate;
            }
            return p;
        });

    } else {
        projectIdCounter++;
        const newProject = {
            id: projectIdCounter,
            nombre: name,
            estado: status,
            fecha_inicio: startDate,
            fecha_fin: endDate,
            members: [loggedInUserEmail] 
        };
        projects.push(newProject);
    }

    saveProjects(projects);
    showProjectsList();
}

function renderProjects() {
    const listElement = document.getElementById('projectList');
    const projects = getProjects();
    
    const userProjects = projects.filter(p => p.members.includes(loggedInUserEmail));

    listElement.innerHTML = '';

    if (userProjects.length === 0) {
        listElement.innerHTML = '<p class="no-items">Aún no eres miembro de ningún proyecto. ¡Crea uno!</p>';
        return;
    }

    const maxId = projects.reduce((max, p) => Math.max(max, p.id), 0);
    projectIdCounter = maxId;

    userProjects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-item';
        const statusClass = 'status-' + project.estado.toLowerCase().replace(/\s/g, '-');
        
        projectDiv.innerHTML = `
            <div class="project-info">
                <h4>${project.nombre}</h4>
                <p>Estado: <span class="status ${statusClass}">${project.estado}</span></p>
                <p>Fechas: ${project.fecha_inicio} a ${project.fecha_fin}</p>
            </div>
            <div class="project-actions">
                <button onclick="goToProjectTasks(${project.id})" class="edit-btn">Ver Tareas</button>
                <button onclick="editProject(${project.id})" class="delete-btn">Editar</button>
            </div>
        `;
        listElement.appendChild(projectDiv);
    });
}

function editProject(projectId) {
    const projects = getProjects();
    const projectToEdit = projects.find(p => p.id === projectId);

    if (projectToEdit) {
        document.getElementById('projectFormTitle').textContent = 'Editar Proyecto';
        document.getElementById('projectName').value = projectToEdit.nombre;
        document.getElementById('projectStatus').value = projectToEdit.estado;
        document.getElementById('projectStartDate').value = projectToEdit.fecha_inicio;
        document.getElementById('projectEndDate').value = projectToEdit.fecha_fin;
        document.getElementById('saveProjectBtn').textContent = 'Guardar Cambios';
        isEditingProjectId = projectId;
        showDashboardView('create-project-view');
    }
}

function goToProjectTasks(projectId) {
    currentProjectId = projectId;
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        document.getElementById('currentProjectTitle').textContent = `Tareas para: ${project.nombre}`;
        showDashboardView('project-tasks-view');
        // Inicializar las referencias y renderizar el tablero
        initKanbanBoard(); 
        renderTasks(); 
    }
}

// Muestra el formulario de creación/edición de tarea
function showCreateTaskForm() {
    isEditingTaskId = null;
    document.getElementById('create-task-form').style.display = 'block';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'Media';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskAssignedTo').value = '';
    document.getElementById('saveTaskBtn').textContent = 'Guardar Tarea';
}

function hideCreateTaskForm() {
    document.getElementById('create-task-form').style.display = 'none';
}


// --- LÓGICA DE TAREAS Y KANBAN (DRAG & DROP) ---

// Inicializa las referencias a los ULs y los listeners de Drop
function initKanbanBoard() {
    statusContainers = {
        pendiente: document.getElementById('lista-pendiente'),
        en_proceso: document.getElementById('lista-en_proceso'),
        hecha: document.getElementById('lista-hecha')
    };
    
    // Aplicar listeners de arrastrar y soltar a los contenedores
    Object.keys(statusContainers).forEach(status => {
        const container = statusContainers[status];
        container.removeEventListener('dragover', dragOver); // Limpieza
        container.removeEventListener('drop', drop); // Limpieza
        
        container.addEventListener('dragover', dragOver);
        container.addEventListener('drop', drop);
        container.dataset.status = status;
    });
}

function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const assignedTo = document.getElementById('taskAssignedTo').value.trim();

    if (!title || !dueDate) {
        alert("Por favor, ingresa el título y la fecha de vencimiento de la tarea.");
        return;
    }

    let tasks = getTasks();

    if (isEditingTaskId) {
        // Modo Edición
        tasks = tasks.map(task => {
            if (task.id === isEditingTaskId) {
                return { 
                    ...task,
                    titulo: title,
                    descripcion: description,
                    prioridad: priority,
                    fecha_vencimiento: dueDate,
                    asignado_a: assignedTo
                };
            }
            return task;
        });

    } else {
        // Modo Agregar
        taskIdCounter++; 
        const newTask = {
            id: taskIdCounter,
            proyecto_id: currentProjectId, // ASIGNACIÓN CLAVE
            titulo: title,
            descripcion: description,
            estado: 'pendiente', // Nueva tarea siempre empieza en pendiente
            prioridad: priority,
            fecha_vencimiento: dueDate,
            asignado_a: assignedTo
        };
        tasks.push(newTask);
    }

    saveTasks(tasks);
    hideCreateTaskForm(); // Ocultar el formulario
    renderTasks(); // Renderizar el tablero
}

function renderTasks() {
    // 1. Limpiar las columnas
    Object.values(statusContainers).forEach(container => container.innerHTML = '');
    
    const tasks = getTasks();
    
    // FILTRADO CLAVE: Solo muestra tareas del proyecto activo
    const projectTasks = tasks.filter(t => t.proyecto_id === currentProjectId);

    if (projectTasks.length === 0) {
        // Mostrar mensaje solo en la columna pendiente si no hay tareas
        if(statusContainers.pendiente) {
            statusContainers.pendiente.innerHTML = '<p class="no-items">Crea la primera tarea.</p>';
        }
        return;
    }
    
    const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
    taskIdCounter = maxId;

    projectTasks.forEach(task => {
        const taskDiv = document.createElement('li');
        taskDiv.id = `task-${task.id}`;
        taskDiv.className = `task-item priority-${task.prioridad.toLowerCase()}`;
        taskDiv.draggable = true;
        
        taskDiv.innerHTML = `
            <h5>${task.titulo}</h5>
            <p class="description">${task.descripcion}</p>
            <p>Vence: <strong>${task.fecha_vencimiento}</strong></p>
            <p class="assigned-to">Asignado a: <strong>${task.asignado_a}</strong></p>
            <div style="text-align: right; margin-top: 10px;">
                <button onclick="editTask(${task.id})" style="width: auto; padding: 5px 10px; font-size: 0.8em; margin: 0;">Editar</button>
            </div>
        `;
        
        // 2. Asignar Eventos Drag & Drop a la tarea
        taskDiv.addEventListener('dragstart', dragStart);
        taskDiv.addEventListener('dragend', dragEnd);

        // 3. Agregar a la columna correcta
        if (statusContainers[task.estado]) {
            statusContainers[task.estado].appendChild(taskDiv);
        }
    });
}

function editTask(taskId) {
    const tasks = getTasks();
    const taskToEdit = tasks.find(task => task.id === taskId);

    if (taskToEdit) {
        showCreateTaskForm(); // Mostrar el formulario
        
        document.getElementById('taskTitle').value = taskToEdit.titulo;
        document.getElementById('taskDescription').value = taskToEdit.descripcion;
        document.getElementById('taskPriority').value = taskToEdit.prioridad;
        document.getElementById('taskDueDate').value = taskToEdit.fecha_vencimiento;
        document.getElementById('taskAssignedTo').value = taskToEdit.asignado_a;

        document.getElementById('saveTaskBtn').textContent = 'Guardar Cambios';
        isEditingTaskId = taskId;
    }
}

// --- LÓGICA DRAG & DROP ---

function dragStart(e) {
    dragSrcElId = parseInt(this.id.split('-')[1]); 
    e.dataTransfer.setData('text/plain', dragSrcElId);
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Efecto visual al arrastrar sobre la columna
    if (e.currentTarget.tagName === 'UL') {
         e.currentTarget.classList.add('drag-over-target');
    }
}

function drop(e) {
    e.preventDefault();
    const targetContainer = e.currentTarget; 
    const newStatus = targetContainer.dataset.status; 
    
    // Quitar efecto visual
    Object.values(statusContainers).forEach(container => container.classList.remove('drag-over-target'));
    
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    
    let tasks = getTasks();
    const tareaIndex = tasks.findIndex(t => t.id === draggedId);
    
    if (tareaIndex > -1 && tasks[tareaIndex].estado !== newStatus) {
        // 1. Actualizar el estado del objeto en la lista
        tasks[tareaIndex].estado = newStatus;
        
        // 2. Simular guardar los datos
        saveTasks(tasks); 
        
        // 3. Re-renderizar para mover la tarjeta a la columna correcta
        renderTasks();
    }
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
    // Limpieza de efecto visual si no se soltó correctamente
    Object.values(statusContainers).forEach(container => container.classList.remove('drag-over-target'));
}

// INICIO: Chequea la sesión al cargar la página
window.onload = checkSession;