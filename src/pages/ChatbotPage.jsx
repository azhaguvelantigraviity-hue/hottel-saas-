import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';

const BOT_RESPONSES = {
  'room availability': 'We currently have Standard Twin, Deluxe King, and Suite rooms available. Check-in is available from today. Would you like me to check specific dates?',
  'check-in': 'Check-in time is 2:00 PM. Early check-in from 10:00 AM is available for ₹500 extra, subject to availability. Late check-out until 12:00 PM is complimentary for Gold+ loyalty members.',
  'checkout': 'Check-out time is 12:00 PM noon. Late check-out until 2:00 PM is available for ₹800. Please inform the front desk at least 2 hours in advance.',
  'restaurant': 'Our restaurant is open: Breakfast 7:00–10:30 AM, Lunch 12:30–3:00 PM, Dinner 7:00–11:00 PM. Room service is available 24/7. Would you like to see the menu?',
  'menu': 'Popular items: Club Sandwich ₹450, Butter Chicken ₹680, Continental Breakfast ₹850, Grilled Fish ₹780. Full menu available at the restaurant or via room service.',
  'amenities': 'We offer: Swimming Pool (6AM–10PM), Spa & Wellness Center, Fitness Center (24/7), Business Center, Free High-Speed WiFi, Valet Parking, Concierge Service, and Airport Transfers.',
  'wifi': 'WiFi Network: GrandMeridian_Guest | Password: Stay@2025. For premium bandwidth, ask at the front desk.',
  'pricing': 'Room rates: Standard Twin ₹2,800/night, Deluxe King ₹4,200/night, Suite ₹8,500/night, Presidential Suite ₹28,000/night. Rates include breakfast for 2.',
  'pet': 'We are a pet-friendly hotel! Pet charges: Small pets ₹500/night, Medium dogs ₹750/night, Large dogs ₹1,000/night. A refundable deposit of ₹2,000 is required.',
  'default': 'Thank you for your question! Our front desk team is available 24/7 to assist you. You can also call us at +91 22 4567 8900 or email concierge@grandmeridian.com.',
};

const QUICK_REPLIES = ['Room Availability', 'Check-in Time', 'Restaurant Menu', 'Amenities', 'Pricing', 'WiFi Password', 'Pet Policy'];

const getBotResponse = (msg) => {
  const lower = msg.toLowerCase();
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return BOT_RESPONSES.default;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id:1, from:'bot', text:'Hello! Welcome to The Grand Meridian. I\'m your AI concierge. How can I assist you today?', time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) },
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
              <button key={qr} onClick={() => sendMessage(qr)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'DM Sans,sans-serif', transition:'all 0.15s' }} onMouseEnter={e=>{e.target.style.borderColor='var(--gold)';e.target.style.color='var(--gold)'}} onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--text2)'}}>{qr}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMessage(input)} placeholder="Type your message..." style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:'10px 18px', color:'var(--text)', fontFamily:'DM Sans,sans-serif', fontSize:14, outline:'none' }} />
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
