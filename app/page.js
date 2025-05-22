'use client'

import { useState, useEffect } from 'react'
import { Mail, AlertCircle, Clock, User, ChevronDown, ChevronRight, Edit3, Plus, X, Check } from 'lucide-react'

export default function EmailPriorityDashboard() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMedium, setShowMedium] = useState(false)
  const [showLow, setShowLow] = useState(false)
  const [editingPriority, setEditingPriority] = useState(null)
  const [todos, setTodos] = useState([])

  // Fetch emails from API
  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails')
      const result = await response.json()
      
      if (response.ok) {
        setEmails(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch emails')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update email priority
  const updatePriority = async (emailId, newPriority) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority })
      })

      if (response.ok) {
        // Update local state
        setEmails(emails.map(email => 
          email.id === emailId 
            ? { ...email, priority: newPriority }
            : email
        ))
        setEditingPriority(null)
      } else {
        alert('Failed to update priority')
      }
    } catch (err) {
      alert('Error updating priority: ' + err.message)
    }
  }

  // Add email to todo list
  const addToTodo = (email) => {
    const todoItem = {
      id: Date.now(),
      emailId: email.id,
      title: `${email.sender_name}: ${email.summary?.substring(0, 50)}...`,
      email: email,
      completed: false,
      addedAt: new Date().toISOString()
    }
    setTodos([...todos, todoItem])
  }

  // Toggle todo completion
  const toggleTodo = (todoId) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, completed: !todo.completed }
        : todo
    ))
  }

  // Remove todo
  const removeTodo = (todoId) => {
    setTodos(todos.filter(todo => todo.id !== todoId))
  }

  // Send test data
  const sendTestData = async () => {
    try {
      const testData = {
        json: {
          Sender_name: "Test Sender",
          Sender_email: "test@example.com",
          summary: "This is a test email to verify the system is working correctly.",
          why_attention: "Testing",
          priority_hml: "High"
        }
      }

      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        alert('Test data sent successfully!')
        fetchEmails()
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (err) {
      alert('Network error: ' + err.message)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Filter emails by priority
  const highPriorityEmails = emails.filter(e => e.priority?.toLowerCase() === 'high')
  const mediumPriorityEmails = emails.filter(e => e.priority?.toLowerCase() === 'medium')
  const lowPriorityEmails = emails.filter(e => e.priority?.toLowerCase() === 'low')

  const PriorityEditor = ({ email, onUpdate, onCancel }) => (
    <div className="flex items-center space-x-2">
      <select
        className="text-sm border rounded px-2 py-1"
        defaultValue={email.priority?.toLowerCase()}
        onChange={(e) => onUpdate(email.id, e.target.value)}
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button
        onClick={onCancel}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )

  const EmailCard = ({ email, isHighPriority = false }) => (
    <div className={`rounded-lg border ${isHighPriority ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-lg font-medium ${isHighPriority ? 'text-red-900' : 'text-gray-900'}`}>
              {email.sender_name || 'Unknown Sender'}
            </h3>
            
            {editingPriority === email.id ? (
              <PriorityEditor 
                email={email}
                onUpdate={updatePriority}
                onCancel={() => setEditingPriority(null)}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(email.priority)}`}>
                  {email.priority || 'Unknown'} Priority
                </span>
                <button
                  onClick={() => setEditingPriority(email.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Edit priority"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {isHighPriority && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className={`text-sm mb-1 ${isHighPriority ? 'text-red-700' : 'text-gray-600'}`}>
            From: {email.sender_email || 'Unknown Email'}
          </p>
          <p className={`mb-2 ${isHighPriority ? 'text-red-800' : 'text-gray-800'}`}>
            {email.summary || 'No summary available'}
          </p>
          <div className={`flex items-center space-x-4 text-sm ${isHighPriority ? 'text-red-600' : 'text-gray-500'}`}>
            <span>Reason: {email.attention_reason || 'Unknown'}</span>
            <span>•</span>  
            <span>{formatDate(email.created_at)}</span>
          </div>
        </div>
        
        <div className="ml-4">
          <button
            onClick={() => addToTodo(email)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
            title="Add to Todo"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Todo
          </button>
        </div>
      </div>
    </div>
  )

  const TodoWidget = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Check className="h-5 w-5 mr-2 text-blue-600" />
          Email Todo List
        </h3>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {todos.filter(t => !t.completed).length}
        </span>
      </div>
      
      {todos.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No todos yet. Add emails from the list below.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {todos.map(todo => (
            <div
              key={todo.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                todo.completed 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`mt-0.5 rounded ${
                  todo.completed
                    ? 'text-green-600 bg-green-100'
                    : 'text-gray-400 bg-white border-2 border-gray-300'
                } w-5 h-5 flex items-center justify-center`}
              >
                {todo.completed && <Check className="h-3 w-3" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {todo.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Priority: {todo.email.priority} | Added {new Date(todo.addedAt).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {todos.filter(t => !t.completed).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </p>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email priorities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Priority Dashboard</h1>
                <p className="text-gray-600">Monitor and track email priorities from your AI agent</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Emails</p>
                    <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">{highPriorityEmails.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                    <p className="text-2xl font-bold text-gray-900">{mediumPriorityEmails.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Priority</p>
                    <p className="text-2xl font-bold text-gray-900">{lowPriorityEmails.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="mb-6">
              <button 
                onClick={sendTestData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Send Test Data
              </button>
            </div>

            {error && (
              <div className="mb-6 px-6 py-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-red-700">Error: {error}</p>
              </div>
            )}

            {/* High Priority Emails - Always Visible */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-red-600">High Priority Emails</h2>
                {highPriorityEmails.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {highPriorityEmails.length}
                  </span>
                )}
              </div>
              
              {highPriorityEmails.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No high priority emails</h3>
                  <p className="text-gray-600">Great! All urgent matters have been addressed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highPriorityEmails.map((email, index) => (
                    <EmailCard key={email.id || index} email={email} isHighPriority={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Medium Priority Accordion */}
            {mediumPriorityEmails.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowMedium(!showMedium)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-yellow-500"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Medium Priority Emails</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {mediumPriorityEmails.length}
                    </span>
                  </div>
                  {showMedium ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {showMedium && (
                  <div className="mt-4 space-y-4">
                    {mediumPriorityEmails.map((email, index) => (
                      <EmailCard key={email.id || index} email={email} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Low Priority Accordion */}
            {lowPriorityEmails.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowLow(!showLow)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Low Priority Emails</h2>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {lowPriorityEmails.length}
                    </span>
                  </div>
                  {showLow ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {showLow && (
                  <div className="mt-4 space-y-4">
                    {lowPriorityEmails.map((email, index) => (
                      <EmailCard key={email.id || index} email={email} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {emails.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email priorities found</h3>
                <p className="text-gray-600 mb-4">Waiting for new email priority data to arrive.</p>
                <button 
                  onClick={sendTestData}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Send Test Data
                </button>
              </div>
            )}
          </div>

          {/* Todo Widget Sidebar */}
          <div className="lg:col-span-1">
            <TodoWidget />
          </div>
        </div>
      </div>
    </div>
  )
}