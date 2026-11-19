export const STATUSES = ['Pending', 'In Progress', 'Completed'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
const STORAGE_KEY = 'task-dashboard-tasks';

// Today's date as YYYY-MM-DD in the user's local time zone
export function todayStr() {
  return toDateStr(new Date());
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function sampleTasks() {
  return [
    { id: makeId(), title: 'Prepare monthly sales report', description: 'Collect figures from all regions and prepare the summary.', employee: 'Priya Sharma', priority: 'High', dueDate: daysFromToday(2), status: 'In Progress' },
    { id: makeId(), title: 'Update employee handbook', description: 'Add the new leave policy section.', employee: 'Arun Kumar', priority: 'Medium', dueDate: daysFromToday(7), status: 'Pending' },
    { id: makeId(), title: 'Fix login page bug', description: 'Users on mobile cannot see the password toggle.', employee: 'Meena Raj', priority: 'High', dueDate: daysFromToday(1), status: 'Pending' },
    { id: makeId(), title: 'Client onboarding call', description: 'Walk the new client through the product.', employee: 'Priya Sharma', priority: 'Low', dueDate: daysFromToday(5), status: 'Completed' },
    { id: makeId(), title: 'Design team newsletter', description: '', employee: 'Arun Kumar', priority: 'Low', dueDate: daysFromToday(10), status: 'In Progress' },
  ];
}

export function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore and fall back to samples
  }
  return sampleTasks();
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    // storage may be full or blocked; the app still works in memory
  }
}
