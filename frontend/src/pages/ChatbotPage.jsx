import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';

const QUICK_REPLIES = [];

const getBotResponse = (msg) => {
  return 'I\'ll connect you with a team member who can help.';
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id:1, from:'bot', text:'Welcome! How can I help you?', time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id:Date.now(), from:'user', text, time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const botMsg = { id:Date.now()+1, from:'bot', text:getBotResponse(text), time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      setMessages(prev => [...prev, botMsg]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:24 }}>
      <div style={{ display:'flex', gap:16, marginBottom:16, flexShrink:0 }}>
        <div style={{ flex:1, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>AI Concierge</div>
            <div style={{ fontSize:12, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }} />Online — Powered by StayOS AI</div>
          </div>
        </div>
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16, textAlign:'center', minWidth:100 }}>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--text)', fontFamily:'DM Mono,monospace' }}>{messages.filter(m=>m.from==='user').length}</div>
          <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase' }}>Messages</div>
        </div>
      </div>

      <div style={{ flex:1, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display:'flex', justifyContent:msg.from==='user'?'flex-end':'flex-start', gap:10, alignItems:'flex-end' }}>
              {msg.from === 'bot' && (
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🤖</div>
              )}
              <div style={{ maxWidth:'70%' }}>
                <div style={{ padding:'12px 16px', borderRadius:msg.from==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:msg.from==='user'?'linear-gradient(135deg,#C9A84C,#8A6F2E)':'var(--surface)', color:msg.from==='user'?'#fff':'var(--text)', fontSize:14, lineHeight:1.5, border:msg.from==='bot'?'1px solid var(--border)':'none' }}>
                  {msg.text}
                </div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:4, textAlign:msg.from==='user'?'right':'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
              <div style={{ padding:'12px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'18px 18px 18px 4px', display:'flex', gap:4, alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', animation:`bounce 1s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {QUICK_REPLIES.map(qr => (
              <button key={qr} onClick={() => sendMessage(qr)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', transition:'all 0.15s' }} onMouseEnter={e=>{e.target.style.borderColor='var(--gold)';e.target.style.color='var(--gold)'}} onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--text2)'}}>{qr}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMessage(input)} placeholder="Type your message..." style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:'10px 18px', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:14, outline:'none' }} />
            <button onClick={() => sendMessage(input)} style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="send" size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
};

export default ChatbotPage;
