// TaskFlow - Nika Hosseini | MIT License

// get elements
const taskTextInput = document.getElementById('taskText');
const taskTimeInput = document.getElementById('taskTime');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const pendingSpan = document.getElementById('pendingCount');
const completedSpan = document.getElementById('completedCount');
const categoryBtns = document.querySelectorAll('.cat');
const colorPicker = document.getElementById('accentColor');
const editNameBtn = document.getElementById('editNameBtn');
const userNameSpan = document.getElementById('userNameDisplay');
const greetingPrefixSpan = document.getElementById('greetingPrefix');
const dateSpan = document.getElementById('currentDate');

let tasks = [];
let currentCategory = 'today';

// name & greeting 
function getGreetingPrefix() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
}

function updateGreetingAndName() {
    greetingPrefixSpan.textContent = getGreetingPrefix();
    let userName = localStorage.getItem('taskflow_user_name');
    if (!userName) {
        userName = prompt("What's your name?", "Nika");
        if (userName && userName.trim() !== "") {
            localStorage.setItem('taskflow_user_name', userName.trim());
            userNameSpan.textContent = userName.trim();
        } else {
            userNameSpan.textContent = "Nika";
        }
    } else {
        userNameSpan.textContent = userName;
    }
}

function askForNewName() {
    let newName = prompt("Enter your name:", userNameSpan.textContent);
    if (newName && newName.trim() !== "") {
        localStorage.setItem('taskflow_user_name', newName.trim());
        userNameSpan.textContent = newName.trim();
    }
}

// date 
function setCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateSpan.textContent = now.toLocaleDateString('en-US', options);
}

// tasks CRUD 
function loadTasks() {
    const saved = localStorage.getItem('taskflow_glass_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        tasks = [
            { id: Date.now() + 1, text: "Do 30 minutes of yoga", time: "07:00", category: "exercise", completed: false },
            { id: Date.now() + 2, text: "Update the MLS listing", time: "10:30", category: "work", completed: false },
            { id: Date.now() + 3, text: "Buy bread", time: "09:15", category: "personal", completed: false },
            { id: Date.now() + 4, text: "Dentist appointment", time: "14:00", category: "personal", completed: true }
        ];
    }
}

function saveTasks() {
    localStorage.setItem('taskflow_glass_tasks', JSON.stringify(tasks));
}

function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    pendingSpan.textContent = pending;
    completedSpan.textContent = completed;
}

function renderTasks() {
    let filtered = tasks;
    if (currentCategory !== 'today') {
        filtered = tasks.filter(t => t.category === currentCategory);
    }

    if (filtered.length === 0) {
        taskList.innerHTML = '<li class="empty-msg">✨ no tasks in this category ✨</li>';
        updateStats();
        return;
    }

    taskList.innerHTML = '';
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';

        const checkSpan = document.createElement('span');
        checkSpan.className = 'task-check' + (task.completed ? ' completed' : '');
        checkSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text' + (task.completed ? ' completed' : '');
        textSpan.textContent = task.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'task-time';
        timeSpan.textContent = task.time || 'no time';

        infoDiv.appendChild(checkSpan);
        infoDiv.appendChild(textSpan);
        infoDiv.appendChild(timeSpan);

        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.appendChild(infoDiv);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
    updateStats();
}

function addTask() {
    const text = taskTextInput.value.trim();
    if (!text) {
        alert('Please write a task');
        return;
    }
    const time = taskTimeInput.value || "12:00";
    let category = currentCategory === 'today' ? 'personal' : currentCategory;
    const newTask = {
        id: Date.now(),
        text: text,
        time: time,
        category: category,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskTextInput.value = '';
    taskTextInput.focus();
}

// category filters
function setupCategories() {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.getAttribute('data-cat');
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });
    document.querySelector('.cat[data-cat="today"]')?.classList.add('active');
}

// accent color picker 
function setupColorPicker() {
    const applyColor = (color) => {
        document.documentElement.style.setProperty('--accent', color);
        const rgb = hexToRgb(color);
        if (rgb) {
            document.documentElement.style.setProperty('--accent-light', `rgb(${Math.min(rgb.r + 30, 255)}, ${Math.min(rgb.g + 30, 255)}, ${Math.min(rgb.b + 30, 255)})`);
        }
    };
    colorPicker.addEventListener('input', (e) => applyColor(e.target.value));
    applyColor(colorPicker.value);
}

function hexToRgb(hex) {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//everything starts here
function init() {
    setCurrentDate();
    updateGreetingAndName();
    loadTasks();
    setupCategories();
    setupColorPicker();
    renderTasks();
    addBtn.addEventListener('click', addTask);
    taskTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    editNameBtn.addEventListener('click', askForNewName);
    // update greeting every minute 
    setInterval(() => {
        greetingPrefixSpan.textContent = getGreetingPrefix();
    }, 60000);
}

init();
