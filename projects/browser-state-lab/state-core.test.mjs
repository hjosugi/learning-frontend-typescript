import assert from "node:assert/strict";
import { createTask, escapeHtml, filterTasks, summarize, toggleTask } from "./state-core.mjs";

const tasks = [
  createTask({ id: "1", title: "  Write tests  ", priority: "high" }),
  createTask({ id: "2", title: "Review UI", priority: "normal", done: true }),
];

assert.equal(tasks[0].title, "Write tests");
assert.equal(filterTasks(tasks, "open").length, 1);
assert.equal(filterTasks(tasks, "done").length, 1);
assert.deepEqual(summarize(tasks), { total: 2, open: 1, high: 1 });
assert.equal(toggleTask(tasks, "1")[0].done, true);
assert.equal(escapeHtml("<button>"), "&lt;button&gt;");
assert.throws(() => createTask({ id: "x", title: "no", priority: "low" }), /title/);

console.log("ok");

