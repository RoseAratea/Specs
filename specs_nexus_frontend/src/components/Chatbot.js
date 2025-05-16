import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chatbot.css';

const allowedRoutes = ['/dashboard', '/profile', '/events', '/announcements', '/membership'];

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am SPECS Assistance. How may I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat/", { message: userMessage.text });
      const botResponse = response.data.response;
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Error from chat endpoint:", error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry, I'm having trouble processing your request." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!allowedRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <div className="chatbot-button" onClick={toggleChat}>
        <i className="fas fa-robot"></i>
      </div>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div>
              <span className="specs-text">SPECS</span>
              <span className="assistance-text"> Assistance</span>
            </div>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="sender-name">{msg.sender === 'bot' ? 'ai' : 'Student'}</div>
                <div className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-wrapper bot">
                <div className="sender-name">ai</div>
                <div className="chat-bubble bot">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;