import { createTask, escapeHtml, filterTasks, summarize, toggleTask } from "./state-core.mjs";

const storageKey = "browser-state-lab:tasks";

const initialTasks = [
  createTask({ id: crypto.randomUUID(), title: "Map state ownership", priority: "high" }),
  createTask({ id: crypto.randomUUID(), title: "Add an accessible filter", priority: "normal", done: true }),
  createTask({ id: crypto.randomUUID(), title: "Write one lesson note", priority: "low" }),
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

  state.tasks.unshift(createTask({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
  }));
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

  state.tasks = toggleTask(state.tasks, button.dataset.id);
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
  return filterTasks(state.tasks, state.filter);
}

function render() {
  const visibleTasks = getVisibleTasks();
  const summary = summarize(state.tasks);

  document.querySelector("#total-count").textContent = String(summary.total);
  document.querySelector("#open-count").textContent = String(summary.open);
  document.querySelector("#high-count").textContent = String(summary.high);

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
        state.tasks = toggleTask(state.tasks, task.id);
        persist();
        render();
      });
      return item;
    }),
  );
}
