// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE INITIALIZATION
// ==========================================
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [
    { id: 1, name: 'Google', url: 'https://google.com' },
    { id: 2, name: 'GitHub', url: 'https://github.com' }
];

// ==========================================
// 1. GREETING & CLOCK SYSTEM
// ==========================================
function updateDateTime() {
    const now = new Date();
    
    // Format Date & Time
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    document.getElementById('date-time').innerText = `${dateString} | ${timeString}`;

    // Dynamic Greeting based on time
    const hours = now.getHours();
    let greetingText = "Good evening";
    if (hours < 12) greetingText = "Good morning";
    else if (hours < 18) greetingText = "Good afternoon";

    document.getElementById('greeting').innerText = greetingText;
}
setInterval(updateDateTime, 1000);
updateDateTime();


// ==========================================
// 2. FOCUS TIMER (With Challenge: Custom Duration)
// ==========================================
let timerInterval = null;
let timeRemaining = 25 * 60; // default 25 mins in seconds
let isTimerRunning = false;

const timerDisplay = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnReset = document.getElementById('btn-reset');
const timerDurationInput = document.getElementById('timer-duration');

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${minutes}:${seconds}`;
}

// Challenge implementation: Dynamic time changing
timerDurationInput.addEventListener('change', () => {
    if (!isTimerRunning) {
        timeRemaining = parseInt(timerDurationInput.value) * 60;
        updateTimerDisplay();
    }
});

btnStart.addEventListener('click', () => {
    if (!isTimerRunning) {
        isTimerRunning = true;
        btnStart.disabled = true;
        btnStop.disabled = false;
        timerDurationInput.disabled = true;

        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert("Time's up! Take a break.");
                resetTimer();
            }
        }, 1000);
    }
});

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    btnStart.disabled = false;
    btnStop.disabled = true;
}
btnStop.addEventListener('click', stopTimer);

function resetTimer() {
    stopTimer();
    timeRemaining = parseInt(timerDurationInput.value) * 60;
    timerDurationInput.disabled = false;
    updateTimerDisplay();
}
btnReset.addEventListener('click', resetTimer);


// ==========================================
// 3. TO-DO LIST (With Challenge: Prevent Duplicate & Sort)
// ==========================================
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const sortSelect = document.getElementById('sort-select');

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();

    if (!taskText) return;

    // Challenge Feature: Prevent Duplicate Tasks
    const isDuplicate = todos.some(todo => todo.text.toLowerCase() === taskText.toLowerCase());
    if (isDuplicate) {
        alert("This task already exists!");
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().getTime()
    };

    todos.push(newTodo);
    saveAndRenderTodos();
    todoInput.value = '';
});

function saveAndRenderTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// Challenge Feature: Sort Tasks
function getSortedTodos() {
    const sortBy = sortSelect.value;
    let sorted = [...todos];

    if (sortBy === 'oldest') {
        sorted.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'newest') {
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'alphabetical') {
        sorted.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'completed') {
        sorted.sort((a, b) => b.completed - a.completed);
    }
    return sorted;
}

function renderTodos() {
    todoList.innerHTML = '';
    const sortedData = getSortedTodos();

    sortedData.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="todo-item-left">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span>${todo.text}</span>
            </div>
            <div class="todo-actions">
                <button class="btn btn-secondary" onclick="editTodo(${todo.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">X</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Global scope window functions for inline onclick listeners
window.toggleTodo = (id) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveAndRenderTodos();
};

window.deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRenderTodos();
};

window.editTodo = (id) => {
    const todo = todos.find(todo => todo.id === id);
    const newText = prompt("Edit your task:", todo.text);
    
    if (newText === null) return; // cancel
    if (newText.trim() === "") {
        alert("Task cannot be empty!");
        return;
    }

    // Prevent duplicate during edit
    const isDuplicate = todos.some(t => t.id !== id && t.text.toLowerCase() === newText.trim().toLowerCase());
    if (isDuplicate) {
        alert("Another task already has this name!");
        return;
    }

    todo.text = newText.trim();
    saveAndRenderTodos();
};

sortSelect.addEventListener('change', renderTodos);


// ==========================================
// 4. QUICK LINKS SYSTEM
// ==========================================
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();

    // Basic URL parsing safety
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    const newLink = { id: Date.now(), name, url };
    quickLinks.push(newLink);
    
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
    renderQuickLinks();

    linkNameInput.value = '';
    linkUrlInput.value = '';
});

function renderQuickLinks() {
    linksContainer.innerHTML = '';
    quickLinks.forEach(link => {
        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        wrapper.innerHTML = `
            <a href="${link.url}" target="_blank" class="quick-link-btn">${link.name}</a>
            <button class="delete-link-btn" onclick="deleteLink(${link.id})">×</button>
        `;
        linksContainer.appendChild(wrapper);
    });
}

window.deleteLink = (id) => {
    quickLinks = quickLinks.filter(link => link.id !== id);
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
    renderQuickLinks();
};


// ==========================================
// INITIAL RENDER
// ==========================================
renderTodos();
renderQuickLinks();