const tg = window.Telegram.WebApp;

let tasks = [];
let currentTab = 'today';
let editTaskIndex = null;

tg.ready().then(() => {
    loadTasks();
});

function loadTasks() {
    const localTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = localTasks;
    tg.CloudStorage.get('tasks').then(cloudTasks => {
        if (cloudTasks) {
            tasks = JSON.parse(cloudTasks);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        displayTasks();
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    tg.CloudStorage.set({ 'tasks': JSON.stringify(tasks) });
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('current-tab-title').innerText = tab.charAt(0).toUpperCase() + tab.slice(1);
    document.querySelectorAll('.tab-bar div').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    displayTasks();
}

function openTaskEditor(isEdit = false) {
    document.getElementById('task-editor').classList.remove('hidden');
    document.getElementById('task-add-button').classList.add('hidden');
    document.getElementById('task-list').classList.add('hidden');
    document.getElementById('task-details').classList.add('hidden');
    document.getElementById('editor-title').innerText = isEdit ? 'Edit Task' : 'New Task';

    if (!isEdit) {
        document.getElementById('task-title-input').value = '';
        document.getElementById('task-description-input').value = '';
    }
}

function closeTaskEditor() {
    document.getElementById('task-editor').classList.add('hidden');
    document.getElementById('task-list').classList.remove('hidden');
    document.getElementById('task-add-button').classList.remove('hidden');
}

function displayTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.filter(task => task.category === currentTab).forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';

        taskDiv.innerHTML = `
            <span class="task-text" onclick="openTaskDetails(${index})">${task.title}</span>
            <div class="task-actions">
                <button onclick="toggleTaskCompletion(${index})">done</button>
                <button onclick="moveToBacklog(${index})">backlog</button>
                <button onclick="deleteTask(${index})">delete</button>
            </div>
        `;
        taskList.appendChild(taskDiv);
    });
}

function openTaskDetails(index) {
    editTaskIndex = index;
    const task = tasks[index];

    document.getElementById('task-title-view').innerText = task.title;
    document.getElementById('task-description-text').innerText = task.description || 'No description available.';
    document.getElementById('task-details').classList.remove('hidden');
    document.getElementById('task-list').classList.add('hidden');
}

function closeTaskDetails() {
    document.getElementById('task-details').classList.add('hidden');
    document.getElementById('task-list').classList.remove('hidden');
}

function enableTaskEditing() {
    const task = tasks[editTaskIndex];
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-description-input').value = task.description || '';
    openTaskEditor(true);
}

function saveTask() {
    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-description-input').value;

    if (!title) {
        alert('Please enter a task title.');
        return;
    }

    if (editTaskIndex !== null) {
        tasks[editTaskIndex] = { title, description, category: currentTab };
        editTaskIndex = null;
    } else {
        tasks.push({ title, description, category: currentTab });
    }

    saveTasks();
    closeTaskEditor();
    displayTasks();
}

function toggleTaskCompletion(index) {
    tasks[index].category = tasks[index].category === 'done' ? 'today' : 'done';
    saveTasks();
    displayTasks();
}

function moveToBacklog(index) {
    tasks[index].category = 'backlog';
    saveTasks();
    displayTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}
