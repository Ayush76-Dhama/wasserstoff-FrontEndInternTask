import React, { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { nanoid } from 'nanoid'

const userColors = {}

function getColor(username) {
  if (!userColors[username]) {
    const colors = ['text-red-500', 'text-green-500', 'text-blue-500', 'text-purple-500']
    userColors[username] = colors[Object.keys(userColors).length % colors.length]
  }
  return userColors[username]
}

export default function Editor() {
  const [username, setUsername] = useState('')
  const [connectedUsers, setConnectedUsers] = useState([])
  const ydoc = useRef(new Y.Doc()).current
  const provider = useRef(null)
  const ytext = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    if (!username) return; // Prevents running if username is not set

    const room = `realtime-editor-room-${nanoid()}`
    provider.current = new WebrtcProvider(room, ydoc)

    // Update connected users
    const updateConnectedUsers = () => {
      const users = provider.current.awareness.getStates()
      setConnectedUsers(Object.keys(users))
    }

    provider.current.awareness.on('change', updateConnectedUsers)

    ytext.current = ydoc.getText('editor')

    const editor = editorRef.current
    editor.innerText = ytext.current.toString()

    ytext.current.observe(() => {
      const content = ytext.current.toString()
      if (editor.innerText !== content) {
        editor.innerText = content
      }
    })

    const handleInput = () => {
      const content = editor.innerText
      ytext.current.delete(0, ytext.current.length)
      ytext.current.insert(0, content)
    }

    editor.addEventListener('input', handleInput)

    return () => {
      editor.removeEventListener('input', handleInput)
      provider.current.destroy()
    }
  }, [username]) // Dependency on username

  const handleUsernameSubmit = () => {
    if (username) {
      // Set awareness state for the user
      provider.current.awareness.setLocalStateField('username', username)
      // Load existing content if the user is logging in again
      const existingContent = ytext.current.toString()
      if (existingContent) {
        editorRef.current.innerText = existingContent // Load existing content
      }
    } else {
      alert('Please enter a username')
    }
  }

  const handleSubmit = () => {
    const content = editorRef.current.innerText.trim()
    if (content) {
      alert(`Submitted content: ${content}`) // Replace this with your submission logic
    } else {
      alert('Please enter some content before submitting.') // Alert if empty
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!username ? (
        <div className="bg-white p-6 rounded shadow-md w-96">
          <h2 className="text-xl font-bold mb-4">Enter Your Username</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <button
            onClick={handleUsernameSubmit}
            className="bg-blue-500 text-white p-2 rounded w-full"
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow-md w-96">
          <div className="mb-4 text-gray-600">
            You are: <span className={`font-semibold ${getColor(username)}`}>{username}</span>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold">Connected Users:</h3>
            <ul>
              {connectedUsers.map((user) => (
                <li key={user} className={`font-semibold ${getColor(user)}`}>{user}</li>
              ))}
            </ul>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] bg-gray-50 p-4 rounded shadow border focus:outline-none"
            spellCheck={true}
          ></div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 text-white p-2 rounded w-full"
          >
            Submit Content
          </button>
        </div>
      )}
    </div>
  )
}
