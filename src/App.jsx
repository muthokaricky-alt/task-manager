import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] })
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch {
        setTasks({ todo: [], inProgress: [], done: [] })
      }
    } else {
      setTasks({
        todo: [
          { id: '1', title: 'Design system', priority: 'high' },
          { id: '2', title: 'Setup project', priority: 'medium' }
        ],
        inProgress: [
          { id: '3', title: 'Build components', priority: 'high' }
        ],
        done: [
          { id: '4', title: 'Research', priority: 'low' }
        ]
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      priority: 'medium'
    }
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, task]
    }))
    setNewTask('')
  }

  const deleteTask = (column, id) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== id)
    }))
  }

  const moveTask = (fromColumn, toColumn, id) => {
    const task = tasks[fromColumn].find(t => t.id === id)
    if (!task) return
    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== id),
      [toColumn]: [...prev[toColumn], task]
    }))
  }

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ]

  if (loading) {
    return <div className="app"><h1>Loading...</h1></div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">📋 Task Manager</h1>
        <p className="app-subtitle">Manage your tasks</p>
      </header>

      <div className="add-task">
        <input
          type="text"
          className="form-input"
          placeholder="Enter task title..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="button button-primary">
          Add Task
        </button>
      </div>

      <div className="board">
        {columns.map(col => (
          <div key={col.id} className="column">
            <div className="column-header">
              <h2>{col.title}</h2>
              <span className="task-count">{tasks[col.id]?.length || 0}</span>
            </div>
            <div className="task-list">
              {tasks[col.id]?.map(task => (
                <div key={task.id} className="task-card">
                  <span className="task-title">{task.title}</span>
                  <div className="task-actions">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    {col.id !== 'todo' && (
                      <button 
                        className="task-action-btn"
                        onClick={() => {
                          const prevCol = columns.findIndex(c => c.id === col.id)
                          const prevColumn = columns[prevCol - 1]?.id
                          if (prevColumn) moveTask(col.id, prevColumn, task.id)
                        }}
                      >
                        ←
                      </button>
                    )}
                    {col.id !== 'done' && (
                      <button 
                        className="task-action-btn"
                        onClick={() => {
                          const nextCol = columns.findIndex(c => c.id === col.id)
                          const nextColumn = columns[nextCol + 1]?.id
                          if (nextColumn) moveTask(col.id, nextColumn, task.id)
                        }}
                      >
                        →
                      </button>
                    )}
                    <button 
                      className="task-action-btn delete-btn"
                      onClick={() => deleteTask(col.id, task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App