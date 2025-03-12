import React, { useState, useRef } from 'react';
import './App.css';

// Define the Priority type
type Priority = 'high' | 'medium' | 'low';

// Define the Task interface
interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}

function App() {
  // State declarations with TypeScript types
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [nextId, setNextId] = useState<number>(0);

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to add a new task
  const addTask = () => {
    if (inputValue.trim() === '') return;
    const newTask: Task = { id: nextId, text: inputValue, completed: false, priority };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    setInputValue('');
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

  // Function to save tasks to a local file
  const saveToFile = () => {
    const data = JSON.stringify(tasks); // Convert tasks array to JSON string
    const blob = new Blob([data], { type: 'application/json' }); // Create a Blob
    const url = URL.createObjectURL(blob); // Create a temporary URL
    const a = document.createElement('a'); // Create an anchor element
    a.href = url;
    a.download = 'todo-list.json'; // Set the file name
    a.click(); // Trigger the download
    URL.revokeObjectURL(url); // Clean up the URL
  };

  // Function to load tasks from a local file
  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedTasks: Task[] = JSON.parse(e.target?.result as string); // Parse JSON
          setTasks(loadedTasks); // Update tasks state
          if (loadedTasks.length > 0) {
            const maxId = Math.max(...loadedTasks.map(task => task.id));
            setNextId(maxId + 1); // Set nextId to avoid ID conflicts
          } else {
            setNextId(0);
          }
        } catch (error) {
          console.error('Error loading tasks:', error); // Log error if parsing fails
        }
      };
      reader.readAsText(file); // Read the file as text
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
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {sortedTasks.map((task) => (
          <li 
            key={task.id} 
            className={`${task.completed ? 'completed' : ''} priority-${task.priority}`}
          >
            <span onClick={() => toggleTask(task.id)}>{task.text}</span>
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
    </div>
  );
}

export default App;