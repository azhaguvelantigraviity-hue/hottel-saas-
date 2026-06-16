import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import './SmartChatBot.css';

const SmartChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1,
    sender: 'bot',
    text: "Hello! I am StayOS AI. How can I help you manage the hotel today?\n\nவணக்கம்! நான் StayOS AI. இன்று ஹோட்டலை நிர்வகிக்க நான் உங்களுக்கு எப்படி உதவ முடியும்?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newUserMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Detect Intent
      const intentRes = await post('/chatbot/smart/query', { query: userText });
      const intent = intentRes.intent || 'summary';

      // 2. Fetch Data & Translation based on intent
      const dataRes = await post(`/chatbot/smart/${intent}?q=${encodeURIComponent(userText)}`, {});
      
      const newBotMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: dataRes.text,
        countTitle: dataRes.countTitle,
        count: dataRes.count,
        tableData: dataRes.tableData,
        buttonLabel: dataRes.buttonLabel,
        redirectUrl: dataRes.redirectUrl
      };
      
      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error('Smart Chatbot Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I couldn't process your request or you do not have permission.\n\nமன்னிக்கவும், உங்கள் கோரிக்கையைச் செயல்படுத்த முடியவில்லை அல்லது உங்களுக்கு அனுமதி இல்லை."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className="smart-chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="smart-chatbot-window">
          <div className="smart-chatbot-header">
            <h3>StayOS Smart AI</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="smart-chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-container ${msg.sender}`}>
                <div className="chat-bubble">
                  {/* Multi-lingual Text */}
                  <div className="chat-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  
                  {/* Count Card Widget */}
                  {msg.countTitle && (
                    <div className="chat-widget-card">
                      <div className="widget-title">{msg.countTitle}</div>
                      <div className="widget-count">{msg.count}</div>
                    </div>
                  )}

                  {/* Table Widget */}
                  {msg.tableData && msg.tableData.length > 0 && (
                    <div className="chat-widget-table-container">
                      <table className="chat-widget-table">
                        <thead>
                          <tr>
                            {Object.keys(msg.tableData[0]).map(key => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.tableData.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val, j) => (
                                <td key={j}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Action Button */}
                  {msg.buttonLabel && msg.redirectUrl && (
                    <button 
                      className="chat-widget-button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(msg.redirectUrl);
                      }}
                    >
                      {msg.buttonLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-container bot">
                <div className="chat-bubble loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="smart-chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me anything... (e.g. Maintenance ethana iruku?)"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SmartChatBot;
