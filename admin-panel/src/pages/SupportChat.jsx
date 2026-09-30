import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, User, Smartphone, Globe, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';

export default function SupportChat() {
  const [messages, setMessages] = useState([
    { id: 1, senderId: 'user_demo', sender: 'Customer (Web & Mobile)', text: 'Hello Admin! I need help with my marketplace order delivery status.', time: '10:14 AM', isAdmin: false },
  ]);
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_admin');
      newSocket.emit('join_chat', 'support_chat');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleMessage = (msg) => {
      if (!msg) return;
      const msgId = msg.id || Date.now();

      setMessages((prev) => {
        if (prev.some(m => m.id === msgId)) return prev;
        return [
          ...prev,
          {
            id: msgId,
            senderId: msg.senderId || 'user_demo',
            sender: msg.isAdmin ? 'Admin Support' : (msg.sender || 'Customer'),
            text: msg.text || msg,
            time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdmin: msg.isAdmin || false
          }
        ];
      });
    };

    newSocket.on('receive_message', handleMessage);
    newSocket.on('chat_message', handleMessage);
    newSocket.on('admin_new_message', handleMessage);

    return () => newSocket.disconnect();
  }, []);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const payload = {
      id: Date.now(),
      chatId: 'support_chat',
      userId: 'user_demo',
      senderId: 'admin_hq',
      sender: 'Admin Support',
      text: replyText,
      isAdmin: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (socket) {
      socket.emit('send_message', payload);
    }

    setReplyText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '12px', borderRadius: '12px' }}>
            <MessageSquare size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Live Support & Customer Chat Moderation <ShieldCheck size={18} color="#10b981" />
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Real-time multi-device sync for Mobile App (Flutter) and Web App (React) users
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${isConnected ? '#10b981' : '#ef4444'}` }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: isConnected ? '#34d399' : '#f87171' }}>
            {isConnected ? 'Socket.io Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="card" style={{ height: '550px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        
        {/* Active Session Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="#818cf8" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Active Customer Stream (user_demo)</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Smartphone size={14} color="#38bdf8" /> Mobile App Sync
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={14} color="#c084fc" /> Client Web Sync
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m) => {
            const isAdminMsg = m.isAdmin || m.sender === 'Admin Support';
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isAdminMsg ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  background: isAdminMsg ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                  border: isAdminMsg ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px',
                  borderRadius: isAdminMsg ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  color: '#fff'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: isAdminMsg ? '#fbcfe8' : '#818cf8', marginBottom: '2px' }}>
                    {m.sender}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.4 }}>{m.text}</div>
                  <div style={{ fontSize: '11px', color: isAdminMsg ? '#f5d0fe' : '#64748b', textAlign: 'right', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    {m.time} {isAdminMsg && <CheckCheck size={13} color="#fff" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Reply Form */}
        <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            type="text"
            placeholder="Type Admin response to broadcast to Mobile & Web user..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '12px 16px',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              border: 'none',
              borderRadius: '10px',
              padding: '0 24px',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={18} /> Reply All
          </button>
        </form>

      </div>
    </div>
  );
}
