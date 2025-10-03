//VARIABLES GLOBALES DE ESTADO
let loggedInUserEmail = null;
let currentProjectId = null; // ID del proyecto que estamos viendo
let taskIdCounter = 0; 
let projectIdCounter = 0;
let isEditingProjectId = null;
let isEditingTaskId = null;


// LÓGICA DE UTILIDAD Y DATOS

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


// LÓGICA DE AUTENTICACIÓN Y VISTAS PRINCIPALES

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

    // Guardar nuevo usuario
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

//LÓGICA DE PROYECTOS

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
        // Modo Edición
        projects = projects.map(p => {
            if (p.id === isEditingProjectId) {
                p.name = name;
                p.status = status;
                p.startDate = startDate;
                p.endDate = endDate;
            }
            return p;
        });

    } else {
        // Modo Creación
        projectIdCounter++;
        const newProject = {
            id: projectIdCounter,
            name: name,
            status: status,
            startDate: startDate,
            endDate: endDate,
            // El usuario que lo crea es el primer miembro
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
    
    // Filtra solo los proyectos donde el usuario actual es miembro
    const userProjects = projects.filter(p => p.members.includes(loggedInUserEmail));

    listElement.innerHTML = '';

    if (userProjects.length === 0) {
        listElement.innerHTML = '<p class="no-tasks">Aún no eres miembro de ningún proyecto. ¡Crea uno!</p>';
        return;
    }

    const maxId = projects.reduce((max, p) => Math.max(max, p.id), 0);
    projectIdCounter = maxId;

    userProjects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-item';
        const statusClass = 'status-' + project.status.toLowerCase().replace(/\s/g, '-');
        
        projectDiv.innerHTML = `
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>Estado: <span class="status ${statusClass}">${project.status}</span></p>
                <p>Fechas: ${project.startDate} a ${project.endDate}</p>
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
        document.getElementById('projectName').value = projectToEdit.name;
        document.getElementById('projectStatus').value = projectToEdit.status;
        document.getElementById('projectStartDate').value = projectToEdit.startDate;
        document.getElementById('projectEndDate').value = projectToEdit.endDate;
        document.getElementById('saveProjectBtn').textContent = 'Guardar Cambios';
        isEditingProjectId = projectId;
        showDashboardView('create-project-view');
    }
}

//LÓGICA DE NAVEGACIÓN DE TAREAS

function goToProjectTasks(projectId) {
    currentProjectId = projectId;
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        document.getElementById('currentProjectTitle').textContent = `Tareas para: ${project.name}`;
        showDashboardView('project-tasks-view');
        showTaskView('list'); // Mostrar la lista de tareas del proyecto
    }
}

function showTaskView(view) {
    document.getElementById('create-task-view').style.display = 'none';
    document.getElementById('list-task-view').style.display = 'none';
    
    isEditingTaskId = null;
    document.getElementById('saveTaskBtn').textContent = 'Agregar Tarea';
    
    if (view === 'create') {
        document.getElementById('create-task-view').style.display = 'block';
        // Limpia el formulario
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDetails').value = '';
        document.getElementById('taskDueDate').value = '';
    } else { // 'list'
        document.getElementById('list-task-view').style.display = 'block';
        renderTasks(); 
    }
}


// LÓGICA DE TAREAS

function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const details = document.getElementById('taskDetails').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

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
                    ...task, // Mantiene el projectId
                    title: title, 
                    details: details, 
                    dueDate: dueDate 
                };
            }
            return task;
        });

    } else {
        // Modo Agregar
        taskIdCounter++; 
        const newTask = {
            id: taskIdCounter,
            projectId: currentProjectId, // Liga la tarea al proyecto actual
            title: title,
            details: details,
            dueDate: dueDate
        };
        tasks.push(newTask);
    }

    saveTasks(tasks);
    showTaskView('list'); 
}

function renderTasks() {
    const taskListElement = document.getElementById('taskList');
    const tasks = getTasks();

    //  muestra tareas del proyecto activo
    const projectTasks = tasks.filter(t => t.projectId === currentProjectId);

    taskListElement.innerHTML = '';

    if (projectTasks.length === 0) {
        taskListElement.innerHTML = '<p class="no-tasks">Aún no hay tareas para este proyecto. ¡Crea una!</p>';
        return;
    }
    
    const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
    taskIdCounter = maxId;

    projectTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
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

function editTask(taskId) {
    const tasks = getTasks();
    const taskToEdit = tasks.find(task => task.id === taskId);

    if (taskToEdit) {
        showTaskView('create'); 
        
        document.getElementById('taskTitle').value = taskToEdit.title;
        document.getElementById('taskDetails').value = taskToEdit.details;
        document.getElementById('taskDueDate').value = taskToEdit.dueDate;

        document.getElementById('saveTaskBtn').textContent = 'Guardar Cambios';
        isEditingTaskId = taskId;
    }
}

function deleteTask(taskId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
        let tasks = getTasks();
        // Filtra y guarda solo las tareas que NO coinciden con el ID
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks(tasks);
        renderTasks();
    }
}

// INICIO: Chequea la sesión al cargar la página
window.onload = checkSession;