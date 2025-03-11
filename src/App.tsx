import { useState } from 'react';
import './App.css';

type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [nextId, setNextId] = useState<number>(0);

  const addTask = () => {
    if (inputValue.trim() === '') return;
    const newTask: Task = { id: nextId, text: inputValue, completed: false, priority: priority };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    setInputValue('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const priorityOrder: { [key in Priority]: number } = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = tasks.slice().sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return (
    <div className="App">
      <h1>Smart To-Do List</h1>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {sortedTasks.map((task) => (
          <li key={task.id} className={`${task.completed ? 'completed' : ''} priority-${task.priority}`}>
            <span onClick={() => toggleTask(task.id)}>{task.text}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;