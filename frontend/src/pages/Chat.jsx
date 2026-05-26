import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User as UserIcon, Shield, Activity, Search } from 'lucide-react';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch chat contacts list
  useEffect(() => {
    fetchPartners();
  }, [user.token]);

  // Handle active partner changes & start polling thread updates
  useEffect(() => {
    if (!activePartner) {
      setMessages([]);
      return;
    }

    // Load initial thread
    fetchMessages(activePartner._id);

    // Set up polling every 4 seconds to get new incoming messages
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchMessages(activePartner._id, true); // silent parameter to prevent loading spin re-trigger
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activePartner, user.token]);

  // Scroll to bottom when messages load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/messages/partners', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPartners(data.data);
      }
    } catch (err) {
      console.error('Error fetching chat contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId, silent = false) => {
    try {
      const res = await fetch(`/api/messages/thread/${partnerId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Only update state if message counts changed to prevent needless re-renders
        if (data.data.length !== messages.length || silent === false) {
          setMessages(data.data);
        }
      }
    } catch (err) {
      console.error('Error loading chat thread', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage(''); // optimistic input clear

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          receiverId: activePartner._id,
          content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        
        // Add to partner list if they weren't in it yet
        if (!partners.some(p => p._id === activePartner._id)) {
          setPartners([activePartner, ...partners]);
        }
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  // Filter partners list based on search query
  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-layout-page">
      <div className="chat-container-card glass-card">
        {/* Left Side: Sidebar Contacts */}
        <div className="chat-sidebar-panel">
          <div className="chat-sidebar-search">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search chat contacts..."
              className="input-control"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chat-partners-list">
            {loading ? (
              <div className="chat-sidebar-loading"><div className="spinner" style={{ width: '24px', height: '24px' }}></div></div>
            ) : filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className={`chat-partner-item ${activePartner?._id === partner._id ? 'active' : ''}`}
                  onClick={() => setActivePartner(partner)}
                >
                  <div className="partner-avatar">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt={partner.name} />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <div className="partner-meta">
                    <span className="partner-name">{partner.name}</span>
                    <span className="partner-role-tag">{partner.role}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-chat-partners">
                <MessageSquare size={36} className="placeholder-icon" />
                <p>No chat history found</p>
                <span className="help-subtext">Doctors and patients can communicate once booked.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Box */}
        <div className="chat-conversation-panel">
          {activePartner ? (
            <>
              {/* Chat Window Header */}
              <div className="chat-window-header">
                <div className="partner-avatar header-avatar">
                  {activePartner.avatar ? (
                    <img src={activePartner.avatar} alt={activePartner.name} />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <div>
                  <h4>{activePartner.name}</h4>
                  <span className="partner-header-role">{activePartner.role}</span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="chat-messages-thread">
                {messages.map((msg) => {
                  const isSentByMe = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`} key={msg._id}>
                      <div className="message-bubble-content">
                        <p>{msg.content}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}></div>
              </div>

              {/* Send Input Bar */}
              <form className="chat-input-bar" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  required
                />
                <button type="submit" className="btn btn-primary chat-send-btn" disabled={!newMessage.trim() || sending}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-window-placeholder">
              <MessageSquare size={52} className="placeholder-icon animate-pulse" />
              <h3>Select a Conversation</h3>
              <p>Pick a doctor or patient from the sidebar directory to begin medical consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
