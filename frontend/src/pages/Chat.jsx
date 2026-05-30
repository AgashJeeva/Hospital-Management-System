import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User as UserIcon, Search } from 'lucide-react';

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
    <div className="h-[calc(100vh-130px)] animate-[fadeIn_0.4s_ease]">
      <div className="flex h-full !p-0 overflow-hidden rounded-xl bg-bg-card backdrop-blur-md border border-border-color shadow-md">
        {/* Left Side: Sidebar Contacts */}
        <div className="w-[80px] md:w-[320px] border-r border-border-color flex flex-col bg-bg-surface shrink-0">
          <div className="p-4 border-b border-border-color relative hidden md:block">
            <Search size={16} className="absolute left-[26px] top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search chat contacts..."
              className="w-full py-2 px-4 pl-10 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-grow overflow-y-auto py-2.5">
            {loading ? (
              <div className="flex justify-center py-5">
                <div className="spinner !w-6 !h-6"></div>
              </div>
            ) : filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className={`flex items-center gap-3 p-3.5 px-5 cursor-pointer transition-all duration-300 border-l-3 border-transparent hover:bg-bg-main ${
                    activePartner?._id === partner._id ? '!bg-primary-light !border-primary' : ''
                  }`}
                  onClick={() => setActivePartner(partner)}
                >
                  <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center overflow-hidden shrink-0">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <div className="flex flex-col hidden md:flex">
                    <span className="text-sm font-semibold text-text-primary leading-tight">{partner.name}</span>
                    <span className="text-[11px] text-text-muted uppercase font-bold mt-0.5 tracking-[0.5px]">{partner.role}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10 px-5 text-text-muted">
                <MessageSquare size={36} className="mb-2" />
                <p className="text-sm font-medium">No chat history found</p>
                <span className="text-xs text-text-muted mt-1 block hidden md:block">
                  Doctors and patients can communicate once booked.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Box */}
        <div className="flex-grow flex flex-col bg-bg-main">
          {activePartner ? (
            <>
              {/* Chat Window Header */}
              <div className="h-16 px-6 bg-bg-surface border-b border-border-color flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center overflow-hidden shrink-0">
                  {activePartner.avatar ? (
                    <img src={activePartner.avatar} alt={activePartner.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary leading-tight">{activePartner.name}</h4>
                  <span className="text-[11px] text-text-muted uppercase font-bold tracking-[0.5px] mt-0.5 block">{activePartner.role}</span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg) => {
                  const isSentByMe = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'}`} key={msg._id}>
                      <div className={`max-w-[60%] p-3 px-4 rounded-lg text-sm relative flex flex-col shadow-xs ${
                        isSentByMe 
                          ? 'bg-primary text-white rounded-br-none' 
                          : 'bg-bg-surface text-text-primary rounded-bl-none border border-border-color'
                      }`}>
                        <p>{msg.content}</p>
                        <span className="text-[10px] mt-1.5 self-end opacity-80">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}></div>
              </div>

              {/* Send Input Bar */}
              <form className="p-4 px-6 bg-bg-surface border-t border-border-color flex gap-3 items-center shrink-0" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-grow py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  required
                />
                <button 
                  type="submit" 
                  className="p-3 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-primary to-secondary shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer disabled:bg-bg-main disabled:text-text-muted disabled:shadow-none disabled:-translate-y-0 disabled:cursor-not-allowed" 
                  disabled={!newMessage.trim() || sending}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow text-center text-text-muted p-10">
              <MessageSquare size={52} className="text-primary opacity-75 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-text-primary">Select a Conversation</h3>
              <p className="text-sm mt-1 max-w-[320px] mx-auto">Pick a doctor or patient from the sidebar directory to begin medical consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
