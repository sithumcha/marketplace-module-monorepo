import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';

export default function ChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Support', text: 'Hello! Welcome to Marketplace Support. How can we help you today?', time: '10:14 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const userId = 'user_demo';

  useEffect(() => {
    if (isOpen) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_user', userId);
        newSocket.emit('join_chat', 'support_chat');
      });

      const handleMessage = (msg) => {
        if (!msg) return;
        const msgId = msg.id || Date.now();
        
        setMessages((prev) => {
          if (prev.some(m => m.id === msgId)) return prev;
          const isMe = msg.senderId === userId || msg.sender === 'You';
          return [
            ...prev,
            {
              id: msgId,
              sender: isMe ? 'You' : (msg.sender || 'Admin Support'),
              text: msg.text || msg,
              time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        });
      };

      newSocket.on('receive_message', handleMessage);
      newSocket.on('chat_message', handleMessage);

      return () => newSocket.disconnect();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgId = Date.now();
    const newMsgPayload = {
      id: msgId,
      chatId: 'support_chat',
      userId: userId,
      senderId: userId,
      sender: 'You',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (socket) {
      socket.emit('send_message', newMsgPayload);
    }

    setInputText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px', height: '600px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Chat Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              M
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Marketplace Support & Live Chat <ShieldCheck size={16} color="#10b981" />
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>● Real-time Multi-Device Sync</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {messages.map((m) => {
            const isMe = m.sender === 'You';
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '80%', 
                  background: isMe ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)', 
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                  color: '#fff' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: isMe ? '#c7d2fe' : '#818cf8', fontWeight: 'bold', marginBottom: '2px' }}>{m.sender}</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>{m.text}</div>
                  <div style={{ fontSize: '0.7rem', color: isMe ? '#a5b4fc' : '#64748b', textAlign: 'right', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                    {m.time} {isMe && <CheckCheck size={13} color="#fff" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
          <input 
            type="text" 
            placeholder="Type a message or inquiry..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.2rem' }}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
