import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Define the Priority type
type Priority = 'high' | 'medium' | 'low';

// Define the Task interface with optional reminder field
interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  reminder?: Date; // Optional reminder field
}

function App() {
  // State declarations with TypeScript types
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [reminderDate, setReminderDate] = useState<Date | null>(null); // For new tasks
  const [nextId, setNextId] = useState<number>(0);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingPriority, setEditingPriority] = useState<Priority>('medium');
  const [editingReminder, setEditingReminder] = useState<Date | null>(null);

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to add a new task with reminder
  const addTask = () => {
    if (inputValue.trim() === '') return;
    const newTask: Task = {
      id: nextId,
      text: inputValue,
      completed: false,
      priority,
      reminder: reminderDate || undefined,
    };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    setInputValue('');
    setReminderDate(null);
  };

  // Function to toggle task completion
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Function to delete a task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Function to start editing a task
  const startEditing = (id: number) => {
    const taskToEdit = tasks.find(task => task.id === id);
    if (taskToEdit) {
      setEditingTaskId(id);
      setEditingText(taskToEdit.text);
      setEditingPriority(taskToEdit.priority);
      setEditingReminder(taskToEdit.reminder || null);
    }
  };

  // Function to save edited task
  const saveEdit = () => {
    setTasks(tasks.map(task =>
      task.id === editingTaskId
        ? { ...task, text: editingText, priority: editingPriority, reminder: editingReminder || undefined }
        : task
    ));
    setEditingTaskId(null); // Exit editing mode
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingTaskId(null); // Exit editing mode without saving
  };

  // Check for due reminders and trigger notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.reminder && task.reminder <= now && !task.completed) {
          toast.info(`Reminder: ${task.text}`);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tasks]);

  // Function to save tasks to a local file
  const saveToFile = () => {
    const tasksToSave = tasks.map((task) => ({
      ...task,
      reminder: task.reminder ? task.reminder.toISOString() : undefined,
    }));
    const data = JSON.stringify(tasksToSave);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-list.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to load tasks from a local file
  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedTasks = JSON.parse(e.target?.result as string).map((task: any) => ({
            ...task,
            reminder: task.reminder ? new Date(task.reminder) : undefined,
          }));
          setTasks(loadedTasks);
          if (loadedTasks.length > 0) {
            const maxId = Math.max(...loadedTasks.map((task: { id: any; }) => task.id));
            setNextId(maxId + 1);
          } else {
            setNextId(0);
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Define priority order for sorting
  const priorityOrder: { [key in Priority]: number } = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Sort tasks by priority
  const sortedTasks = tasks.slice().sort((a, b) =>
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );

  // Render the UI
  return (
    <div className="App">
      <h1>Smart To-Do List</h1>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          placeholder="Add a new task"
        />
        <select
          value={priority}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setPriority(e.target.value as Priority)
          }
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <DatePicker
          selected={reminderDate}
          onChange={(date: Date | null) => setReminderDate(date)}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Set reminder"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {sortedTasks.map((task) => (
          editingTaskId === task.id ? (
            // Editing view
            <li key={task.id} className={`priority-${editingPriority}`}>
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
              />
              <select
                value={editingPriority}
                onChange={(e) => setEditingPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <DatePicker
                selected={editingReminder}
                onChange={(date: Date | null) => setEditingReminder(date)}
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Set reminder"
              />
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </li>
          ) : (
            // Normal view
            <li
              key={task.id}
              className={`${task.completed ? 'completed' : ''} priority-${task.priority}`}
            >
              <span onClick={() => toggleTask(task.id)}>
                {task.text} {task.reminder && ` - Reminder: ${task.reminder.toLocaleString()}`}
              </span>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
              <button onClick={() => startEditing(task.id)}>Edit</button>
            </li>
          )
        ))}
      </ul>
      <div>
        <button onClick={saveToFile}>Save to File</button>
        <button onClick={() => fileInputRef.current?.click()}>Load from File</button>
        <input
          type="file"
          accept=".json"
          onChange={loadFromFile}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;