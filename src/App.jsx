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
    { id: 'todo', title: 'To Do', icon: '📝' },
    { id: 'inProgress', title: 'In Progress', icon: '⚡' },
    { id: 'done', title: 'Done', icon: '✅' }
  ]

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
      default: return ''
    }
  }

  const totalTasks = Object.values(tasks).reduce((sum, col) => sum + col.length, 0)
  const completedTasks = tasks.done.length

  if (loading) {
    return (
      <div className="app">
        <div className="skeleton-header" />
        <div className="skeleton-stats" />
        <div className="skeleton-board">
          <div className="skeleton-column" />
          <div className="skeleton-column" />
          <div className="skeleton-column" />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Task Manager</h1>
          <p className="app-subtitle">Organize your work, one task at a time</p>
        </div>
        <div className="header-right">
          <div className="stats">
            <span className="stat-item">
              <span className="stat-number">{totalTasks}</span>
              <span className="stat-label">Total</span>
            </span>
            <span className="stat-divider"></span>
            <span className="stat-item">
              <span className="stat-number">{completedTasks}</span>
              <span className="stat-label">Done</span>
            </span>
            <span className="stat-divider"></span>
            <span className="stat-item">
              <span className="stat-number">{Math.round((completedTasks / totalTasks) * 100) || 0}%</span>
              <span className="stat-label">Progress</span>
            </span>
          </div>
        </div>
      </header>

      <div className="add-task">
        <div className="input-group">
          <input
            type="text"
            className="form-input"
            placeholder="What do you want to get done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} className="button button-primary">
            Add Task
          </button>
        </div>
      </div>

      <div className="board">
        {columns.map(col => (
          <div key={col.id} className="column">
            <div className="column-header">
              <div className="column-title">
                <span className="column-icon">{col.icon}</span>
                <h2>{col.title}</h2>
              </div>
              <span className="task-count">{tasks[col.id]?.length || 0}</span>
            </div>
            <div className="task-list">
              {tasks[col.id]?.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No tasks here</p>
                </div>
              ) : (
                tasks[col.id]?.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-content">
                      <span className="task-title">{task.title}</span>
                      <span className={`priority-badge priority-${task.priority}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <div className="task-actions">
                      {col.id !== 'todo' && (
                        <button 
                          className="task-action-btn move-left"
                          onClick={() => {
                            const prevCol = columns.findIndex(c => c.id === col.id)
                            const prevColumn = columns[prevCol - 1]?.id
                            if (prevColumn) moveTask(col.id, prevColumn, task.id)
                          }}
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button 
                          className="task-action-btn move-right"
                          onClick={() => {
                            const nextCol = columns.findIndex(c => c.id === col.id)
                            const nextColumn = columns[nextCol + 1]?.id
                            if (nextColumn) moveTask(col.id, nextColumn, task.id)
                          }}
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button 
                        className="task-action-btn delete-btn"
                        onClick={() => deleteTask(col.id, task.id)}
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
