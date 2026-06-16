import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import './SmartChatBot.css';

const QUICK_ACTIONS = [
  { label: 'Rooms', icon: '🏨', intent: 'rooms' },
  { label: 'Bookings', icon: '📅', intent: 'bookings' },
  { label: 'Maintenance', icon: '🔧', intent: 'maintenance' },
  { label: 'Housekeeping', icon: '🧹', intent: 'housekeeping' },
  { label: 'Employees', icon: '👥', intent: 'employees' },
  { label: 'Payments', icon: '💰', intent: 'payments' },
  { label: 'Reports', icon: '📊', intent: 'reports' },
  { label: 'Notifications', icon: '🔔', intent: 'notifications' },
  { label: 'Food Orders', icon: '🍽', intent: 'food-orders' },
  { label: 'Travel Desk', icon: '🚗', intent: 'travel-desk' },
  { label: 'Branches', icon: '🏢', intent: 'branches' },
  { label: 'Analytics', icon: '📈', intent: 'analytics' }
];

const SmartChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1,
    sender: 'bot',
    text: "Hello! I am your StayOS Hotel Management Assistant. Select a quick action below or ask me a question to begin.",
    isGreeting: true
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text, overrideIntent = null) => {
    if (!text.trim()) return;

    const userText = text.trim();
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      let intent = overrideIntent;
      if (!intent) {
        const intentRes = await post('/chatbot/smart/query', { query: userText });
        intent = intentRes.intent || 'summary';
      }

      const dataRes = await post(`/chatbot/smart/${intent}?q=${encodeURIComponent(userText)}`, {});
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: dataRes.text,
        stats: dataRes.stats,
        tableData: dataRes.tableData,
        buttons: dataRes.buttons || [],
        suggestedActions: dataRes.suggestedActions || []
      }]);
    } catch (error) {
      console.error('Smart Chatbot Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I encountered an error accessing that module. You may not have sufficient permissions."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="smart-chatbot-fab" onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="smart-chatbot-window">
          <div className="smart-chatbot-header">
            <h3>StayOS AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="smart-chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-container ${msg.sender}`}>
                <div className="chat-bubble">
                  <div className="chat-text">{msg.text}</div>
                  
                  {/* Quick Actions (Only on greeting) */}
                  {msg.isGreeting && (
                    <div className="quick-actions-grid">
                      {QUICK_ACTIONS.map(action => (
                        <button key={action.label} className="quick-action-btn" onClick={() => handleSend(`Show ${action.label.toLowerCase()}`, action.intent)}>
                          <span className="action-icon">{action.icon}</span>
                          <span className="action-label">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Rich Stats Array */}
                  {msg.stats && Object.keys(msg.stats).length > 0 && (
                    <div className="chat-stats-container">
                      {Object.entries(msg.stats).map(([key, val]) => (
                        <div key={key} className="chat-stat-item">
                          <div className="stat-label">{key}</div>
                          <div className="stat-value">{val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table Widget */}
                  {msg.tableData && msg.tableData.length > 0 && (
                    <div className="chat-widget-table-container">
                      <table className="chat-widget-table">
                        <thead>
                          <tr>{Object.keys(msg.tableData[0]).map(key => <th key={key}>{key}</th>)}</tr>
                        </thead>
                        <tbody>
                          {msg.tableData.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Multiple Action Buttons */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="chat-buttons-container">
                      {msg.buttons.map((btn, i) => (
                        <button key={i} className={`chat-widget-button ${i === 0 ? 'primary' : 'secondary'}`} onClick={() => { setIsOpen(false); navigate(btn.url); }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Suggested Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="chat-suggested-actions">
                      <div className="suggested-title">Suggested Actions:</div>
                      {msg.suggestedActions.map((action, i) => (
                        <button key={i} className="suggested-pill" onClick={() => handleSend(action)}>
                          {action}
                        </button>
                      ))}
                    </div>
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

          <form className="smart-chatbot-input" onSubmit={e => { e.preventDefault(); handleSend(input); }}>
            <input type="text" placeholder="Ask your assistant... (e.g. Pending maintenance)" value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SmartChatBot;
