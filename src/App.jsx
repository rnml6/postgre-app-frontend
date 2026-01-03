import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Layout from './components/Layout'
import MessageSection from './components/MessageSection'
import PostSection from './components/PostSection'
import './App.css'

const API_BASE_URL = 'https://postgre-app-backend.onrender.com'

function App () {
  const [activeTab, setActiveTab] = useState('posts')
  const [messages, setMessages] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState({
    messages: false,
    posts: false,
    sending: false
  })
  const [error, setError] = useState(null)

  const fetchMessages = useCallback(async () => {
    setLoading(prev => ({ ...prev, messages: true }))
    setError(null)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/all`)
      if (res.data.success) {
        setMessages(res.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, messages: false }))
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(prev => ({ ...prev, posts: true }))
    setError(null)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/all`)
      if (res.data.success) {
        setPosts(res.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, posts: false }))
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    fetchPosts()

    const interval = setInterval(() => {
      if (activeTab === 'messages') {
        fetchMessages()
      } else {
        fetchPosts()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [activeTab, fetchMessages, fetchPosts])

  const handleSendMessage = async content => {
    if (!content.trim()) return

    setLoading(prev => ({ ...prev, sending: true }))
    setError(null)

    try {
      await axios.post(`${API_BASE_URL}/api/messages/new`, {
        content: content.trim(),
        timestamp: new Date().toISOString()
      })
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, sending: false }))
    }
  }

  const handleSendPost = async ({ caption, images }) => {
    if (!caption.trim() && (!images || images.length === 0)) return

    setLoading(prev => ({ ...prev, sending: true }))
    setError(null)

    const formData = new FormData()
    formData.append('caption', caption.trim())
    formData.append('timestamp', new Date().toISOString())

    if (images && images.length > 0) {
      images.forEach(img => {
        formData.append('images', img)
      })
    }

    try {
      await axios.post(`${API_BASE_URL}/api/posts/new`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await fetchPosts()
    } catch (error) {
      console.error('Error sending post:', error)
      setError('Failed to send post. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, sending: false }))
    }
  }

  const formatDate = dateString => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Date error'
    }
  }

  const handleRetry = () => {
    if (activeTab === 'messages') {
      fetchMessages()
    } else {
      fetchPosts()
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {error && (
        <div className='error-alert'>
          <span>{error}</span>
          <button onClick={handleRetry} className='retry-btn'>
            Retry
          </button>
          <button onClick={() => setError(null)} className='close-btn'>
            ×
          </button>
        </div>
      )}

      {activeTab === 'messages' ? (
        <MessageSection
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading.messages || loading.sending}
          isSending={loading.sending}
          formatDate={formatDate}
        />
      ) : (
        <PostSection
          posts={posts}
          onSendPost={handleSendPost}
          loading={loading.posts || loading.sending}
          isSending={loading.sending}
          formatDate={formatDate}
        />
      )}
    </Layout>
  )
}

export default App
