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
  const [reminderDate, setReminderDate] = useState<Date | null>(null); // New state for reminder
  const [nextId, setNextId] = useState<number>(0);

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
      reminder: reminderDate || undefined, // Include reminder if set
    };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    setInputValue('');
    setReminderDate(null); // Reset the date picker
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

  // Check for due reminders and trigger notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.reminder && task.reminder <= now && !task.completed) {
          toast.info(`Reminder: ${task.text}`);
          // Optional: Uncomment to clear reminder after notification
          // setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminder: undefined } : t));
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tasks]);

  // Function to save tasks to a local file
  const saveToFile = () => {
    const tasksToSave = tasks.map((task) => ({
      ...task,
      reminder: task.reminder ? task.reminder.toISOString() : undefined, // Convert Date to string
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
            reminder: task.reminder ? new Date(task.reminder) : undefined, // Convert string to Date
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
          dateFormat="Pp" // Example: "10/25/2023, 2:30 PM"
          placeholderText="Set reminder"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {sortedTasks.map((task) => (
          <li
            key={task.id}
            className={`${task.completed ? 'completed' : ''} priority-${task.priority}`}
          >
            <span onClick={() => toggleTask(task.id)}>
              {task.text} {task.reminder && ` - Reminder: ${task.reminder.toLocaleString()}`}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
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