import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldCheck, User, Search, Circle, Tag, Users, CheckCheck, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

export default function SupportChat() {
  // Dynamic customer conversation threads (Loaded from MongoDB /api/users & /api/chats/support/all)
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const selectedThreadIdRef = useRef(selectedThreadId);
  selectedThreadIdRef.current = selectedThreadId;

  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedThreadId) {
      scrollToBottom();
    }
  }, [selectedThreadId, threads]);

  // Fetch support chat messages from MongoDB + initialize Socket.io connection
  useEffect(() => {
    const loadSupportMessages = () => {
      fetch('http://localhost:5000/api/chats/support/all')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.messages)) {
            const threadMap = {};
            const activeId = selectedThreadIdRef.current;

            data.messages.forEach(msg => {
              const senderId = String(msg.senderId || msg.userEmail || '');
              const senderName = msg.senderName || msg.sender || 'Customer User';
              const userEmail = msg.userEmail || '';
              const isAdmin = Boolean(msg.isAdmin);
              const targetUserId = String(msg.targetUserId || '');

              const formattedMsg = {
                id: msg._id || msg.id || Date.now(),
                senderId,
                targetUserId,
                sender: isAdmin ? 'Admin Support' : senderName,
                senderName: isAdmin ? 'Admin Support' : senderName,
                text: msg.text || '',
                type: msg.type || 'text',
                offerData: msg.offerData,
                time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                isAdmin
              };

              let threadKey = '';
              if (!isAdmin) {
                threadKey = userEmail || senderId || `user_${senderName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
              } else {
                threadKey = targetUserId || userEmail || senderId;
              }

              if (!threadKey || threadKey === 'admin_hq') return;

              let displayName = senderName || (userEmail ? userEmail.split('@')[0] : 'Customer');
              if (!displayName || displayName === 'You' || displayName === 'Customer User' || displayName === 'Web Customer') {
                displayName = userEmail ? userEmail.split('@')[0] : 'Customer';
              }

              if (!threadMap[threadKey]) {
                threadMap[threadKey] = {
                  id: threadKey,
                  email: userEmail,
                  name: isAdmin ? (userEmail ? userEmail.split('@')[0] : 'Customer') : displayName,
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  device: 'Customer Client',
                  online: true,
                  lastMessage: formattedMsg.text,
                  lastTime: formattedMsg.time,
                  unreadCount: 0,
                  messages: []
                };
              }

              if (!isAdmin && displayName && displayName !== 'Admin Support' && displayName !== 'You' && displayName !== 'Customer User' && displayName !== 'Web Customer') {
                threadMap[threadKey].name = displayName;
              }
              if (userEmail && (!threadMap[threadKey].email || threadMap[threadKey].email === '')) {
                threadMap[threadKey].email = userEmail;
              }

              const isDuplicate = threadMap[threadKey].messages.some(m => 
                String(m.id) === String(formattedMsg.id) ||
                (m.text === formattedMsg.text && m.sender === formattedMsg.sender && m.time === formattedMsg.time)
              );

              if (!isDuplicate) {
                threadMap[threadKey].messages.push(formattedMsg);
                threadMap[threadKey].lastMessage = formattedMsg.text || 'New message';
                threadMap[threadKey].lastTime = formattedMsg.time;
              }
            });

            const updatedThreads = Object.values(threadMap);
            setThreads(updatedThreads);
          }
        })
        .catch(err => console.log('Fetch support messages error:', err));
    };

    // Initial fetch + 1.5 second REST API polling
    loadSupportMessages();
    const pollTimer = setInterval(loadSupportMessages, 1500);

    // Socket.io for immediate fallback
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

    newSocket.on('receive_message', loadSupportMessages);
    newSocket.on('chat_message', loadSupportMessages);
    newSocket.on('admin_new_message', loadSupportMessages);

    return () => {
      clearInterval(pollTimer);
      newSocket.disconnect();
    };
  }, []);

  // Handle active thread selection
  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
  };

  // Handle sending Admin reply to selected customer
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThreadId) return;

    const activeThread = threads.find(t => t.id === selectedThreadId);
    const targetUserId = activeThread ? activeThread.id : selectedThreadId;
    const threadEmail = activeThread?.email || (targetUserId.includes('@') ? targetUserId : null);
    const msgId = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const payload = {
      id: msgId,
      chatId: 'support_chat',
      userId: targetUserId,
      senderId: 'admin_hq',
      targetUserId: targetUserId,
      recipientId: targetUserId,
      userEmail: threadEmail,
      sender: 'Admin Support',
      senderName: 'Admin Support',
      text: replyText,
      isAdmin: true,
      time: timeStr
    };

    fetch('http://localhost:5000/api/chats/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.log('Admin reply REST error:', err));

    if (socket) {
      socket.emit('send_message', payload);
    }

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThreadId) {
        return {
          ...t,
          lastMessage: replyText,
          lastTime: timeStr,
          messages: [
            ...t.messages,
            {
              id: msgId,
              senderId: 'admin_hq',
              targetUserId: targetUserId,
              sender: 'Admin Support',
              senderName: 'Admin Support',
              text: replyText,
              time: timeStr,
              isAdmin: true
            }
          ]
        };
      }
      return t;
    }));

    setReplyText('');
  };

  const handleDeleteThread = (e, threadId, threadName, threadEmail) => {
    if (e) e.stopPropagation();
    Swal.fire({
      title: 'Delete Conversation?',
      html: `Are you sure you want to delete all chat history for <b>${threadName}</b>?<br/><span style="color:#ef4444;font-size:12px">This will permanently erase chat records from MongoDB.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Chat',
      background: '#1e293b',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        const query = threadEmail ? `?email=${encodeURIComponent(threadEmail)}` : '';
        fetch(`http://localhost:5000/api/chats/thread/${encodeURIComponent(threadId)}${query}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setThreads(prev => prev.filter(t => t.id !== threadId));
              if (selectedThreadId === threadId) {
                setSelectedThreadId(null);
              }
              Swal.fire({
                title: 'Deleted!',
                text: `Conversation with ${threadName} has been deleted.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
              });
            }
          })
          .catch(err => console.log('Delete error:', err));
      }
    });
  };

  const handleDeleteSingleMessage = (messageId) => {
    fetch(`http://localhost:5000/api/chats/message/${encodeURIComponent(messageId)}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setThreads(prev => prev.map(t => ({
            ...t,
            messages: t.messages.filter(m => String(m.id) !== String(messageId))
          })));
        }
      })
      .catch(err => console.log('Delete message error:', err));
  };

  const activeThread = selectedThreadId ? threads.find(t => t.id === selectedThreadId) : null;
  const filteredThreads = threads.filter(t => {
    const nameLower = (t.name || '').toLowerCase();
    const isInvalid = nameLower === 'you' || nameLower === 'customer user' || t.id === 'user_demo' || t.id === 'user_guest';
    return !isInvalid && nameLower.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 110px)' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Customer Support Messenger <ShieldCheck size={18} color="#10b981" />
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Select a customer thread from the left list to view isolated messages or reply in real-time
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${isConnected ? '#10b981' : '#ef4444'}` }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: isConnected ? '#34d399' : '#f87171' }}>
              {isConnected ? 'Socket.io Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messenger 2-Column Split Interface */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', borderRadius: '16px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Left Panel: Messenger Users Sidebar */}
        <div style={{ width: '310px', minWidth: '310px', maxWidth: '310px', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
          
          {/* Sidebar Header & Search */}
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#818cf8" /> Messenger Users ({filteredThreads.length})
              </span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>● Online</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search messenger users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '8px 10px 8px 32px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Messenger Users List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {filteredThreads.map(thread => {
              const isSelected = thread.id === selectedThreadId;
              return (
                <div
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(236, 72, 153, 0.2))' : 'transparent',
                    border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={thread.avatar}
                      alt={thread.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: thread.online ? '#10b981' : '#64748b',
                      border: '2px solid #0f172a'
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {thread.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>{thread.lastTime}</span>
                        <button
                          onClick={(e) => handleDeleteThread(e, thread.id, thread.name, thread.email)}
                          title="Delete Chat Thread"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: isSelected ? '#e2e8f0' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {thread.lastMessage}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span style={{ background: '#ec4899', color: '#fff', fontSize: '10px', fontWeight: '800', borderRadius: '10px', padding: '1px 6px' }}>
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Panel: Active Customer Conversation View OR Welcome Empty State */}
        {activeThread ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            
            {/* Active Thread Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={activeThread.avatar}
                  alt={activeThread.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeThread.name}
                    <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '6px', padding: '1px 8px' }}>
                      {activeThread.device || 'Active Customer'}
                    </span>
                  </h4>
                  <span style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Circle size={7} fill="#34d399" color="#34d399" /> Live Connected • User ID: {activeThread.id}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => alert(`Customer Profile:\nName: ${activeThread.name}\nEmail: ${activeThread.email || 'N/A'}\nRole/Device: ${activeThread.device}\nUser ID: ${activeThread.id}`)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 12px', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  View Profile
                </button>

                <button
                  onClick={(e) => handleDeleteThread(e, activeThread.id, activeThread.name, activeThread.email)}
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '6px 12px', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} /> Delete Chat
                </button>
              </div>
            </div>

            {/* Chat Messages Stream with High-Contrast Crisp Bubbles */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0f172a' }}>
              {activeThread.messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', fontSize: '13px' }}>
                  No previous messages with {activeThread.name}. Type a message below to start conversation!
                </div>
              ) : (
                activeThread.messages.map((m) => {
                  const isAdminMsg = m.isAdmin || m.sender === 'Admin Support';
                  const isOffer = m.type === 'offer';
                  const displayName = isAdminMsg ? 'Admin Support' : (m.senderName || activeThread.name);

                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isAdminMsg ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%',
                        background: isAdminMsg ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
                        border: isAdminMsg ? 'none' : '1px solid #334155',
                        padding: '12px 16px',
                        borderRadius: isAdminMsg ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: isAdminMsg ? '#f3e8ff' : '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!isAdminMsg && <User size={12} color="#38bdf8" />}
                          {displayName}
                        </div>

                        {isOffer ? (
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', marginTop: '4px', border: '1px solid #f59e0b' }}>
                            <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={14} /> Price Offer Received: ${m.offerData?.amount}
                            </div>
                            <div style={{ fontSize: '13px', margin: '4px 0', color: '#fff' }}>{m.text}</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13.5px', lineHeight: 1.45, color: '#ffffff', wordBreak: 'break-word' }}>{m.text}</div>
                        )}

                        <div style={{ fontSize: '10.5px', color: isAdminMsg ? '#e0e7ff' : '#94a3b8', textAlign: 'right', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {m.time} {isAdminMsg && <CheckCheck size={13} color="#e0e7ff" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Answer Chips */}
            <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#1e293b' }}>
              {[
                "👋 Hello! How can I assist you today?",
                "🚚 Your order is being processed and will ship shortly.",
                "✅ Thank you! Your request has been resolved.",
                "💰 Please provide your order ID to verify."
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyText(template)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#a5b4fc',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#1e293b' }}>
              <input
                type="text"
                placeholder={`Type reply to ${activeThread.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 22px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> Reply
              </button>
            </form>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '16px', padding: '40px', textAlign: 'center', background: '#0f172a' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))', padding: '24px', borderRadius: '50%', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <MessageSquare size={44} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                Select a Customer Conversation
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '380px', margin: 0, lineHeight: 1.5 }}>
                Choose a user from the Messenger Users list on the left to view messages or reply in real-time.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
