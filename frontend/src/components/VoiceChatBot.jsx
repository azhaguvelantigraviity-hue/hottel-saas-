import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { postForm } from '../services/api';

const VoiceChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am StayOS Assistant. Hold the microphone button and speak to ask me a question.' }
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Add a temporary processing message
      setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

      const response = await postForm('/chatbot', formData);
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop(); // Remove the "..."
        newMsgs.push({ sender: 'user', text: response.transcription });
        newMsgs.push({ sender: 'bot', text: response.response });
        return newMsgs;
      });

    } catch (err) {
      console.error('Chatbot API Error:', err);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop();
        newMsgs.push({ sender: 'bot', text: 'Sorry, I encountered an error processing your request.' });
        return newMsgs;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {isOpen && (
        <div style={{ 
          width: '320px', height: '450px', background: 'var(--surface)', 
          borderRadius: '16px', border: '1px solid var(--border)', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', 
          flexDirection: 'column', marginBottom: '16px', overflow: 'hidden' 
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)', padding: '16px', 
            color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="message-square" size={18} color="#fff" /> StayOS Assistant
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              ✖
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--card)',
                color: msg.sender === 'user' ? '#fff' : 'var(--text)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: '13px', lineHeight: 1.5,
                borderBottomRightRadius: msg.sender === 'user' ? 0 : '12px',
                borderBottomLeftRadius: msg.sender === 'bot' ? 0 : '12px',
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ padding: '16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '8px' }}>
            <button 
              onMouseDown={startRecording} 
              onMouseUp={stopRecording} 
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              style={{ 
                width: '60px', height: '60px', borderRadius: '50%', 
                background: isRecording ? 'var(--rose)' : (isProcessing ? 'var(--border2)' : 'var(--primary)'), 
                border: 'none', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: isRecording ? '0 0 15px rgba(239,68,68,0.5)' : 'none',
                transition: 'all 0.2s ease', transform: isRecording ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {isProcessing ? '⏳' : '🎤'}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
              {isRecording ? 'Listening... Release to send.' : (isProcessing ? 'Thinking...' : 'Hold to speak')}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)', 
            border: 'none', color: '#fff', cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default VoiceChatBot;
