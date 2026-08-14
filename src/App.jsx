import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  // State for tasks organized by columns
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] })
  
  // State for new task form
  const [newTask, setNewTask] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  
  // State for undo feature
  const [deletedTask, setDeletedTask] = useState(null)
  const [showUndo, setShowUndo] = useState(false)
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('')
  
  // State for dark mode
  const [darkMode, setDarkMode] = useState(false)
  
  // State for editing
  const [editingTask, setEditingTask] = useState(null)
  
  // Ref for input focus
  const inputRef = useRef(null)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    const storedTheme = localStorage.getItem('darkMode')
    
    if (storedTheme) {
      setDarkMode(JSON.parse(storedTheme))
    }
    
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks))
      } catch {
        setTasks({ todo: [], inProgress: [], done: [] })
      }
    } else {
      // Seed data for first-time users
      setTasks({
        todo: [
          { id: '1', title: 'Design system', priority: 'high', createdAt: Date.now() - 86400000 },
          { id: '2', title: 'Setup project', priority: 'medium', createdAt: Date.now() - 43200000 }
        ],
        inProgress: [
          { id: '3', title: 'Build components', priority: 'high', createdAt: Date.now() - 21600000 }
        ],
        done: [
          { id: '4', title: 'Research', priority: 'low', createdAt: Date.now() - 10800000 }
        ]
      })
    }
    setLoading(false)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  // Add a new task to the "To Do" column
  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      priority: newTaskPriority,
      createdAt: Date.now()
    }
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, task]
    }))
    setNewTask('')
    setNewTaskPriority('medium')
    inputRef.current?.focus()
  }

  // Delete a task from any column with undo support
  const deleteTask = (column, id) => {
    const taskToDelete = tasks[column].find(t => t.id === id)
    if (!taskToDelete) return
    
    setDeletedTask({ column, task: taskToDelete })
    setShowUndo(true)
    
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== id)
    }))
    
    // Auto-hide undo notification after 5 seconds
    setTimeout(() => {
      setShowUndo(false)
      setDeletedTask(null)
    }, 5000)
  }

  // Undo the last deleted task
  const undoDelete = () => {
    if (!deletedTask) return
    const { column, task } = deletedTask
    setTasks(prev => ({
      ...prev,
      [column]: [...prev[column], task]
    }))
    setShowUndo(false)
    setDeletedTask(null)
  }

  // Move a task from one column to another
  const moveTask = (fromColumn, toColumn, id) => {
    const task = tasks[fromColumn].find(t => t.id === id)
    if (!task) return
    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== id),
      [toColumn]: [...prev[toColumn], task]
    }))
  }

  // Update priority of an existing task
  const updatePriority = (column, id, newPriority) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].map(task =>
        task.id === id ? { ...task, priority: newPriority } : task
      )
    }))
  }

  // Edit task title inline
  const editTaskTitle = (column, id, newTitle) => {
    if (!newTitle.trim()) return
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].map(task =>
        task.id === id ? { ...task, title: newTitle.trim() } : task
      )
    }))
    setEditingTask(null)
  }

  // Column definitions with icons
  const columns = [
    { id: 'todo', title: 'To Do', icon: '📝' },
    { id: 'inProgress', title: 'In Progress', icon: '⚡' },
    { id: 'done', title: 'Done', icon: '✅' }
  ]

  // Helper: Get priority label with emoji
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return '🔴 High'
      case 'medium': return '🟡 Medium'
      case 'low': return '🟢 Low'
      default: return ''
    }
  }

  // Helper: Calculate stats for header
  const totalTasks = Object.values(tasks).reduce((sum, col) => sum + col.length, 0)
  const completedTasks = tasks.done.length

  // Helper: Cycle through priorities (low → medium → high → low)
  const cyclePriority = (currentPriority) => {
    const priorities = ['low', 'medium', 'high']
    const currentIndex = priorities.indexOf(currentPriority)
    const nextIndex = (currentIndex + 1) % priorities.length
    return priorities[nextIndex]
  }

  // Helper: Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter tasks based on search term
  const getFilteredTasks = (columnTasks) => {
    if (!searchTerm.trim()) return columnTasks
    return columnTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Enter to add task
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        addTask()
      }
      // Escape to clear input
      if (e.key === 'Escape') {
        setNewTask('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [addTask])

  // Show loading skeletons while data loads
  if (loading) {
    return (
      <div className={`app ${darkMode ? 'dark' : ''}`}>
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
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Header with title and stats */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Task Manager</h1>
          <p className="app-subtitle">Organize your work, one task at a time</p>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
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

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Add task form */}
      <div className="add-task">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="What do you want to get done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            maxLength={100}
          />
          <span className="char-counter">{newTask.length}/100</span>
          <select
            className="priority-select"
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <button onClick={addTask} className="button button-primary">
            Add Task
          </button>
        </div>
        <div className="keyboard-hint">
          Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to add · <kbd>Esc</kbd> to clear
        </div>
      </div>

      {/* Undo notification */}
      {showUndo && (
        <div className="undo-notification">
          <span>Task deleted</span>
          <button onClick={undoDelete} className="undo-btn">↩️ Undo</button>
        </div>
      )}

      {/* Kanban board with 3 columns */}
      <div className="board">
        {columns.map(col => (
          <div key={col.id} className="column">
            {/* Column header */}
            <div className="column-header">
              <div className="column-title">
                <span className="column-icon">{col.icon}</span>
                <h2>{col.title}</h2>
              </div>
              <span className="task-count">{getFilteredTasks(tasks[col.id] || []).length}</span>
            </div>

            {/* Task list for this column */}
            <div className="task-list">
              {getFilteredTasks(tasks[col.id] || []).length === 0 ? (
                // Empty state
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>{searchTerm ? 'No matching tasks' : 'No tasks here'}</p>
                </div>
              ) : (
                // Render each task
                getFilteredTasks(tasks[col.id] || []).map(task => {
                  const isEditing = editingTask?.id === task.id && editingTask?.column === col.id
                  
                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-content">
                        {isEditing ? (
                          <input
                            type="text"
                            className="task-edit-input"
                            defaultValue={task.title}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                editTaskTitle(col.id, task.id, e.target.value)
                              }
                              if (e.key === 'Escape') {
                                setEditingTask(null)
                              }
                            }}
                            onBlur={(e) => {
                              editTaskTitle(col.id, task.id, e.target.value)
                            }}
                            autoFocus
                            maxLength={100}
                          />
                        ) : (
                          <span 
                            className="task-title"
                            onDoubleClick={() => setEditingTask({ id: task.id, column: col.id })}
                            title="Double-click to edit"
                          >
                            {task.title}
                          </span>
                        )}
                        <button
                          className={`priority-badge priority-${task.priority}`}
                          onClick={() => {
                            const newPriority = cyclePriority(task.priority)
                            updatePriority(col.id, task.id, newPriority)
                          }}
                          title="Click to change priority"
                        >
                          {getPriorityLabel(task.priority)}
                        </button>
                        <span className="task-date" title={formatDate(task.createdAt)}>
                          📅 {formatDate(task.createdAt)}
                        </span>
                      </div>
                      {/* Task action buttons */}
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
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App