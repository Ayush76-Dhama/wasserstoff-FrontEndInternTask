import React, { useState } from 'react'
import Editor from './Editor'

export default function App() {
  const [username, setUsername] = useState('')
  const [entered, setEntered] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) setEntered(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!entered ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-700">Enter your username</h2>
          <input
            type="text"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join
          </button>
        </form>
      ) : (
        <Editor username={username} />
      )}
    </div>
  )
}
