import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import MessageSection from './components/MessageSection';
import PostSection from './components/PostSection';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [activeTab, setActiveTab] = useState('posts');
  const [messages, setMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/all`);
      setMessages(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/posts/all`);
      setPosts(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMessages();
    fetchPosts();
    const interval = setInterval(() => {
      activeTab === 'messages' ? fetchMessages() : fetchPosts();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSendMessage = async (content) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/messages/new`, { content });
      fetchMessages();
    } finally { setLoading(false); }
  };

  const handleSendPost = async ({ caption, images }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('caption', caption);
    images.forEach(img => formData.append('images', img));
    try {
      await axios.post(`${API_BASE_URL}/posts/new`, formData);
      fetchPosts();
    } finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'messages' ? (
        <MessageSection 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          loading={loading}
          formatDate={formatDate}
        />
      ) : (
        <PostSection 
          posts={posts} 
          onSendPost={handleSendPost} 
          loading={loading}
          formatDate={formatDate}
        />
      )}
    </Layout>
  );
}

export default App;