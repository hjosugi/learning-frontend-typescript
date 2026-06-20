export function createTask({ id, title, priority, done = false }) {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length < 3) {
    throw new Error("title must be at least 3 characters");
  }
  return {
    id,
    title: normalizedTitle,
    priority,
    done,
  };
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

export function filterTasks(tasks, filter) {
  if (filter === "open") return tasks.filter((task) => !task.done);
  if (filter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

export function summarize(tasks) {
  return {
    total: tasks.length,
    open: tasks.filter((task) => !task.done).length,
    high: tasks.filter((task) => task.priority === "high").length,
  };
}

export function escapeHtml(value) {
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

