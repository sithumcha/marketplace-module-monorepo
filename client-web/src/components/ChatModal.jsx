import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, CheckCheck, Tag, User, Sparkles, Clock, MessageSquare, Lock, LogIn } from 'lucide-react';
import { io } from 'socket.io-client';

export default function ChatModal({ isOpen, onClose, user, item, onOpenAuth }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Helper to dynamically extract logged in user info
  const getActiveUser = () => {
    let name = '';
    let id = '';
    let email = '';

    if (user && (user.name || user.email)) {
      name = user.name || name;
      id = user._id || user.id || user.email || '';
      email = user.email || '';
    }
    
    if (!name || !email) {
      try {
        const saved = localStorage.getItem('marketplace_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) name = parsed.name;
          if (parsed._id || parsed.id || parsed.email) id = parsed._id || parsed.id || parsed.email;
          if (parsed.email) email = parsed.email;
        }
      } catch(e) {}
    }

    const isLoggedIn = Boolean(email);
    if (!name) {
      name = email ? email.split('@')[0] : 'Guest Customer';
    }
    if (!id) {
      id = email || `user_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }

    return { name, id, email, isLoggedIn };
  };

  // Pre-fill inquiry text if opened for a specific product
  useEffect(() => {
    if (isOpen && item) {
      const title = item.title || 'this product';
      const priceStr = item.price ? ` (LKR ${item.price.toLocaleString()})` : '';
      setInputText(`Hi Admin! Is "${title}"${priceStr} available in stock?`);
    } else if (isOpen && !inputText) {
      setInputText('');
    }
  }, [isOpen, item]);

  // Fetch messages from MongoDB REST API & set up polling/socket sync
  useEffect(() => {
    if (!isOpen) return;

    const { name: currentUserName, id: currentUserId, email: currentUserEmail, isLoggedIn } = getActiveUser();
    if (!isLoggedIn) return;

    const fetchMessagesFromDB = () => {
      const targetKey = currentUserEmail || currentUserId;
      const queryParams = new URLSearchParams();
      if (currentUserEmail) queryParams.append('email', currentUserEmail);
      if (currentUserId) queryParams.append('id', currentUserId);

      fetch(`http://localhost:5000/api/chats/user/${encodeURIComponent(targetKey)}?${queryParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.messages)) {
            const formatted = data.messages.map(m => {
              const isAdmin = Boolean(m.isAdmin);
              const isMe = !isAdmin && (
                m.senderId === currentUserId || 
                (currentUserEmail && m.userEmail === currentUserEmail) || 
                m.sender === currentUserName ||
                m.senderName === currentUserName
              );
              return {
                id: String(m._id || m.id),
                sender: isMe ? 'You' : (isAdmin ? 'Admin Support' : (m.senderName || m.sender || 'Admin Support')),
                text: m.text || '',
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                isMe,
                rawTime: m.createdAt || 0
              };
            });

            // Deduplicate by message ID & text content
            const uniqueMsgs = [];
            const seenKeys = new Set();
            for (const msgItem of formatted) {
              const key = msgItem.id ? msgItem.id : `${msgItem.text}_${msgItem.time}_${msgItem.isMe}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueMsgs.push(msgItem);
              }
            }

            setMessages(uniqueMsgs);
          }
        })
        .catch(err => console.log('REST chat fetch error:', err));
    };

    fetchMessagesFromDB();
    const interval = setInterval(fetchMessagesFromDB, 2000);

    // Socket fallback
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.emit('join_user', currentUserId);
    newSocket.emit('join_chat', 'support_chat');

    newSocket.on('receive_message', fetchMessagesFromDB);
    newSocket.on('chat_message', fetchMessagesFromDB);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const activeUser = getActiveUser();

  if (!activeUser.isLoggedIn) {
    return (
      <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.65)' }}>
        <div 
          className="modal-content" 
          style={{ 
            maxWidth: '480px', 
            borderRadius: '24px', 
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
            padding: '28px',
            textAlign: 'center'
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)' }}>
            <Lock size={30} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            Login Required to Chat
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            You must be logged in to your account to send live support messages and inquire about products with merchants.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={onClose}
              style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => { onClose(); if (onOpenAuth) onOpenAuth(); }}
              style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}
            >
              <LogIn size={18} /> Log In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { name: activeUserName } = getActiveUser();

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const { name: currentUserName, id: currentUserId, email: currentUserEmail } = getActiveUser();
    const textToSend = inputText.trim();
    setInputText('');

    const newMsgPayload = {
      chatId: 'support_chat',
      senderId: currentUserId,
      userEmail: currentUserEmail,
      sender: currentUserName,
      senderName: currentUserName,
      userName: currentUserName,
      device: 'Client Web',
      text: textToSend,
      isAdmin: false
    };

    // Optimistic UI update
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'You',
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
    ]);

    // Send via REST API directly to MongoDB
    try {
      await fetch('http://localhost:5000/api/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsgPayload)
      });
    } catch(err) {
      console.log('Error sending REST message:', err);
    }

    if (socket) {
      socket.emit('send_message', newMsgPayload);
    }
  };

  const quickChips = [
    "👋 Is this item in stock?",
    "🚚 What is the delivery time?",
    "💰 Can I get a discount?",
    "✅ Thank you! Resolved."
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.65)' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '560px', 
          height: '650px', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0, 
          borderRadius: '24px', 
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sleek Modern Gradient Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', 
          padding: '16px 22px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
              }}>
                M
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: '1px', 
                right: '1px', 
                width: '11px', 
                height: '11px', 
                borderRadius: '50%', 
                background: '#10b981', 
                border: '2px solid #0f172a' 
              }} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.2px' }}>
                Marketplace Support <ShieldCheck size={17} color="#34d399" />
              </h4>
              <span style={{ fontSize: '0.76rem', color: '#a5b4fc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                ● Real-time Live Assistant • Logged in as {activeUserName}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.12)', 
              border: 'none', 
              color: '#ffffff', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Product Context Banner */}
        {item && (
          <div style={{ 
            background: 'linear-gradient(135deg, #e0e7ff 0%, #eeaeca 100%)', 
            padding: '10px 16px', 
            margin: '12px 18px 0 18px', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            border: '1px solid #c7d2fe',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#fff', border: '1px solid #cbd5e1' }}>
              <img 
                src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150'} 
                alt={item.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', color: '#4338ca', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Product Inquiry Context:
              </div>
              <div style={{ fontSize: '0.86rem', color: '#1e1b4b', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title} {item.price ? `- LKR ${item.price.toLocaleString()}` : ''}
              </div>
            </div>
          </div>
        )}

        {/* High-Contrast Professional Messages Feed */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '18px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px',
          background: '#f8fafc' 
        }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', padding: '30px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <MessageSquare size={28} />
              </div>
              <h5 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Welcome to Live Support</h5>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '280px' }}>
                Send a message or select a quick question below to start chatting with Admin.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.isMe || m.sender === 'You';
              return (
                <div key={m.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '78%', 
                    background: isMe ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : '#ffffff', 
                    border: isMe ? 'none' : '1px solid #e2e8f0', 
                    padding: '12px 16px', 
                    borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                    color: isMe ? '#ffffff' : '#0f172a',
                    boxShadow: isMe ? '0 4px 14px rgba(79, 70, 229, 0.25)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}>
                    
                    {/* Bubble Sender Label */}
                    <div style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: '800', 
                      color: isMe ? '#e0e7ff' : '#4f46e5', 
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {!isMe && <ShieldCheck size={13} color="#10b981" />}
                      {m.sender}
                    </div>

                    {/* Bubble Content */}
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: isMe ? '#ffffff' : '#1e293b', wordBreak: 'break-word', fontWeight: '500' }}>
                      {m.text}
                    </div>

                    {/* Time & Read Status */}
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: isMe ? '#c7d2fe' : '#94a3b8', 
                      textAlign: 'right', 
                      marginTop: '4px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end', 
                      gap: '3px' 
                    }}>
                      {m.time} {isMe && <CheckCheck size={13} color="#ffffff" />}
                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ 
          padding: '8px 16px', 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9'
        }}>
          {quickChips.map((chipText, i) => (
            <button
              key={i}
              onClick={() => { setInputText(chipText); }}
              style={{
                background: '#e0e7ff',
                border: '1px solid #c7d2fe',
                color: '#3730a3',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c7d2fe'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#e0e7ff'}
            >
              {chipText}
            </button>
          ))}
        </div>

        {/* Modern Crisp Input Form */}
        <form 
          onSubmit={handleSend} 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            padding: '14px 18px', 
            background: '#ffffff', 
            borderTop: '1px solid #e2e8f0' 
          }}
        >
          <input 
            type="text" 
            placeholder="Type your message or question..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ 
              flex: 1, 
              background: '#f8fafc', 
              border: '1px solid #cbd5e1', 
              padding: '12px 18px', 
              borderRadius: '14px', 
              color: '#0f172a', 
              fontSize: '0.92rem',
              outline: 'none',
              fontWeight: '500',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
              border: 'none', 
              borderRadius: '14px', 
              padding: '0 20px', 
              color: '#ffffff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              transition: 'transform 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <Send size={18} color="#ffffff" />
          </button>
        </form>

      </div>
    </div>
  );
}
