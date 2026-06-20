const storageKey = "browser-state-lab:tasks";

const initialTasks = [
  { id: crypto.randomUUID(), title: "Map state ownership", priority: "high", done: false },
  { id: crypto.randomUUID(), title: "Add an accessible filter", priority: "normal", done: true },
  { id: crypto.randomUUID(), title: "Write one lesson note", priority: "low", done: false },
];

const state = {
  filter: "all",
  tasks: loadTasks(),
};

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (title.length < 3) {
    titleInput.reportValidity();
    return;
  }

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
    done: false,
  });
  titleInput.value = "";
  persist();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    render();
  });
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='toggle']");
  if (!button) return;

  const task = state.tasks.find((item) => item.id === button.dataset.id);
  if (!task) return;

  task.done = !task.done;
  persist();
  render();
});

render();

function loadTasks() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return initialTasks;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialTasks;
  } catch {
    return initialTasks;
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state.tasks));
}

function getVisibleTasks() {
  if (state.filter === "open") return state.tasks.filter((task) => !task.done);
  if (state.filter === "done") return state.tasks.filter((task) => task.done);
  return state.tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();

  document.querySelector("#total-count").textContent = String(state.tasks.length);
  document.querySelector("#open-count").textContent = String(state.tasks.filter((task) => !task.done).length);
  document.querySelector("#high-count").textContent = String(
    state.tasks.filter((task) => task.priority === "high").length,
  );

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });

  taskList.replaceChildren(
    ...visibleTasks.map((task) => {
      const item = document.createElement("li");
      item.className = `task ${task.done ? "done" : ""}`;
      item.innerHTML = `
        <input type="checkbox" ${task.done ? "checked" : ""} aria-label="Toggle ${escapeHtml(task.title)}" />
        <span>
          <strong>${escapeHtml(task.title)}</strong>
          <small>${task.priority} priority</small>
        </span>
        <button type="button" data-action="toggle" data-id="${task.id}">
          ${task.done ? "Reopen" : "Complete"}
        </button>
      `;
      item.querySelector("input").addEventListener("change", () => {
        state.tasks = state.tasks.map((current) =>
          current.id === task.id ? { ...current, done: !current.done } : current,
        );
        persist();
        render();
      });
      return item;
    }),
  );
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

