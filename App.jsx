import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Icon from './components/Icon.jsx';
import Dashboard from './components/Dashboard.jsx';
import SearchAndFilter from './components/SearchAndFilter.jsx';
import TaskList from './components/TaskList.jsx';
import TaskForm from './components/TaskForm.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { loadTasks, saveTasks, makeId } from './utils/taskUtils.js';

const EMPTY_FILTERS = { search: '', employee: '', status: '', priority: '' };

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);       // all tasks (single source of truth)
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = adding a new task
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);       // mobile sidebar

  // Save to localStorage whenever tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // If the selected employee no longer exists (e.g. after delete/rename), reset that filter
  const employees = [...new Set(tasks.map((t) => t.employee))].sort();
  useEffect(() => {
    if (filters.employee && !employees.includes(filters.employee)) {
      setFilters((f) => ({ ...f, employee: '' }));
    }
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply search + all filters together
  const query = filters.search.trim().toLowerCase();
  const visibleTasks = tasks.filter((t) => {
    const matchesSearch =
      !query || t.title.toLowerCase().includes(query) || t.employee.toLowerCase().includes(query);
    const matchesEmployee = !filters.employee || t.employee === filters.employee;
    const matchesStatus = !filters.status || t.status === filters.status;
    const matchesPriority = !filters.priority || t.priority === filters.priority;
    return matchesSearch && matchesEmployee && matchesStatus && matchesPriority;
  });

  function openAddForm() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(null);
  }

  function handleSave(data) {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)));
    } else {
      setTasks((prev) => [{ id: makeId(), status: 'Pending', ...data }, ...prev]);
    }
    closeForm();
  }

  function handleStatusChange(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function handleDeleteConfirmed() {
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  }

  function handleFilterChange(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar
          tasks={tasks}
          activeStatus={filters.status}
          onSelect={(status) => handleFilterChange('status', status)}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="app-main">
          <Topbar onMenuClick={() => setMenuOpen(true)} />

          <main className="container">
            <div className="page-head">
              <div>
                <h1>Task Dashboard</h1>
                <p>Track and manage your team's tasks in one place.</p>
              </div>
              <button className="btn btn-primary" onClick={openAddForm}>
                <Icon name="plus" size={18} />
                Add Task
              </button>
            </div>

            <Dashboard tasks={tasks} />

            <SearchAndFilter
              filters={filters}
              employees={employees}
              onChange={handleFilterChange}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />

            <TaskList
              tasks={visibleTasks}
              totalCount={tasks.length}
              onEdit={openEditForm}
              onDelete={setTaskToDelete}
              onStatusChange={handleStatusChange}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
            />
          </main>
        </div>
      </div>

      {formOpen && <TaskForm task={editingTask} onSave={handleSave} onCancel={closeForm} />}

      {taskToDelete && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${taskToDelete.title}" will be removed permanently.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </>
  );
}
