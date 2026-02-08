import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiSend,
  FiMoreVertical,
  FiPaperclip,
  FiSmile,
  FiInfo,
  FiUsers,
  FiMessageSquare,
  FiArrowLeft,
  FiChevronLeft,
} from 'react-icons/fi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { messagesAPI, authAPI } from '../api';

const POLL_INTERVAL = 3000;

// Status Indicator Component
const StatusIndicator = ({ status }) => {
  const statusColors = {
    online: 'bg-[#22c55e]',
    away: 'bg-[#f59e0b]',
    offline: 'bg-[#64748b]',
  };

  return (
    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d1219] ${statusColors[status] || statusColors.offline}`} />
  );
};

// Avatar Component
const Avatar = ({ src, name, size = 'md', showStatus, status }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-[#1a5f2a] flex items-center justify-center`}>
          <span className={`font-bold text-[#4ade80] ${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      {showStatus && <StatusIndicator status={status} />}
    </div>
  );
};

const MessagesPage = () => {
  const { conversationId: paramConversationId } = useParams();
  const [searchParams] = useSearchParams();
  const conversationId = paramConversationId || searchParams.get('conversation');
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false); // Mobile: toggle between list and chat
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const shouldScrollRef = useRef(true);

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOnlineStatus = (participant) => {
    if (!participant?.last_active) return 'offline';
    const lastActive = new Date(participant.last_active);
    const now = new Date();
    const minutesAgo = (now - lastActive) / (1000 * 60);
    if (minutesAgo < 2) return 'online';
    if (minutesAgo < 10) return 'away';
    return 'offline';
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await messagesAPI.getConversations();
        const conversationsData = response.data?.conversations || response.conversations || [];

        const transformedConversations = conversationsData.map(conv => {
          const isTeamChat = conv.type === 'team' || conv.conversation_type === 'team';
          const otherParticipant = conv.participants?.find(
            p => (p._id || p) !== user?._id
          ) || conv.participants?.[0];

          let participantData;
          if (isTeamChat) {
            participantData = {
              id: conv.team?._id || conv.team,
              name: conv.name || conv.team?.team_name || 'Team Chat',
              avatar: conv.team?.logo || null,
              status: 'online',
              isTeam: true,
            };
          } else {
            participantData = {
              id: otherParticipant?._id || otherParticipant,
              name: otherParticipant?.first_name
                ? `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`.trim()
                : otherParticipant?.username || 'Unknown',
              avatar: otherParticipant?.avatar || null,
              status: getOnlineStatus(otherParticipant),
              isTeam: false,
            };
          }

          return {
            id: conv._id || conv.id,
            participant: participantData,
            lastMessage: {
              text: conv.last_message?.content || conv.lastMessage?.text || 'No messages yet',
              time: conv.last_message?.sent_at
                ? formatMessageTime(conv.last_message.sent_at)
                : conv.lastMessage?.time || '',
              unread: conv.unread_count || 0,
            },
          };
        });

        setConversations(transformedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const loadedConversationRef = useRef(null);

  const loadMessages = useCallback(async (convId, silent = false) => {
    try {
      if (!silent) {
        setIsLoadingMessages(true);
      }
      const response = await messagesAPI.getConversation(convId);
      const messagesData = response.data?.messages || response.messages || response.data?.conversation?.messages || [];

      const transformedMessages = messagesData.map(msg => ({
        id: msg._id || msg.id,
        senderId: msg.sender?._id || msg.sender || msg.senderId,
        text: msg.content || msg.text,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : msg.time || '',
      }));

      if (silent) {
        const lastMsgId = transformedMessages[transformedMessages.length - 1]?.id;
        if (lastMsgId && lastMsgId !== lastMessageIdRef.current) {
          shouldScrollRef.current = true;
          setMessages(transformedMessages);
          lastMessageIdRef.current = lastMsgId;
        }
      } else {
        shouldScrollRef.current = true;
        setMessages(transformedMessages);
        lastMessageIdRef.current = transformedMessages[transformedMessages.length - 1]?.id;
      }
    } catch (error) {
      if (!silent) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        setMessages([]);
      }
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        // Clear messages and update conversation if it's different
        if (loadedConversationRef.current !== conversationId) {
          setMessages([]);
          lastMessageIdRef.current = null;
          loadedConversationRef.current = conversationId;
          loadMessages(conversationId);
        }
        setActiveConversation(conv);
        setShowChat(true); // Show chat on mobile when conversation is selected
      }
    } else if (conversations.length > 0 && !activeConversation) {
      const firstConv = conversations[0];
      setActiveConversation(firstConv);
      if (loadedConversationRef.current !== firstConv.id) {
        setMessages([]);
        lastMessageIdRef.current = null;
        loadedConversationRef.current = firstConv.id;
        loadMessages(firstConv.id);
      }
    }
  }, [conversationId, conversations, loadMessages, activeConversation]);

  useEffect(() => {
    if (shouldScrollRef.current && messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      shouldScrollRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (!activeConversation?.id) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      loadMessages(activeConversation.id, true);
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeConversation?.id, loadMessages]);

  useEffect(() => {
    const fetchConversationsSilent = async () => {
      try {
        const response = await messagesAPI.getConversations();
        const conversationsData = response.data?.conversations || response.conversations || [];

        const transformedConversations = conversationsData.map(conv => {
          const isTeamChat = conv.type === 'team' || conv.conversation_type === 'team';
          const otherParticipant = conv.participants?.find(
            p => (p._id || p) !== user?._id
          ) || conv.participants?.[0];

          let participantData;
          if (isTeamChat) {
            participantData = {
              id: conv.team?._id || conv.team,
              name: conv.name || conv.team?.team_name || 'Team Chat',
              avatar: conv.team?.logo || null,
              status: 'online',
              isTeam: true,
            };
          } else {
            participantData = {
              id: otherParticipant?._id || otherParticipant,
              name: otherParticipant?.first_name
                ? `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`.trim()
                : otherParticipant?.username || 'Unknown',
              avatar: otherParticipant?.avatar || null,
              status: getOnlineStatus(otherParticipant),
              isTeam: false,
            };
          }

          return {
            id: conv._id || conv.id,
            participant: participantData,
            lastMessage: {
              text: conv.last_message?.content || conv.lastMessage?.text || 'No messages yet',
              time: conv.last_message?.sent_at
                ? formatMessageTime(conv.last_message.sent_at)
                : conv.lastMessage?.time || '',
              unread: conv.unread_count || 0,
            },
          };
        });

        setConversations(transformedConversations);
      } catch (error) {
        console.error('Silent poll error:', error);
      }
    };

    const sendHeartbeat = async () => {
      try {
        await authAPI.heartbeat();
      } catch {
        // Silently ignore heartbeat errors
      }
    };

    const conversationPollInterval = setInterval(fetchConversationsSilent, POLL_INTERVAL * 2);
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    sendHeartbeat();

    return () => {
      clearInterval(conversationPollInterval);
      clearInterval(heartbeatInterval);
    };
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const optimisticMsg = {
      id: Date.now(),
      senderId: user?._id || user?.id || 'me',
      text: messageContent,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    shouldScrollRef.current = true;
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await messagesAPI.sendMessage(activeConversation.id, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    // Clear messages first to avoid showing old messages
    const isSameConversation = loadedConversationRef.current === conv.id;
    if (!isSameConversation) {
      setMessages([]);
      lastMessageIdRef.current = null;
    }
    // Update active conversation immediately
    setActiveConversation(conv);
    setShowChat(true);
    loadedConversationRef.current = conv.id;
    loadMessages(conv.id, isSameConversation);
  };

  const handleBackToList = () => {
    setShowChat(false);
    // Note: Keep activeConversation so the desktop view still shows the selected conversation
    // but the mobile view will show the list
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Hidden on mobile when chat is open */}
        <div className={`bg-[#0d1219] border border-[#1c2430] rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 ${showChat ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#a855f7]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#a855f7]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                <span className="text-[#4ade80]">Messages</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#64748b]">
                {conversations.length} conversations
              </p>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 h-[calc(100vh-12rem)] sm:h-[calc(100vh-16rem)]">
          {/* Conversations List */}
          <div className={`bg-[#0d1219] border border-[#1c2430] rounded-xl flex flex-col overflow-hidden h-full ${showChat ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-[#1c2430]">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#64748b]" />
                  </div>
                  <p className="text-[#64748b] text-sm sm:text-base">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 sm:p-4 border-b border-[#1c2430] hover:bg-[#141c28] transition-colors ${
                      activeConversation?.id === conv.id ? 'bg-[#141c28]' : ''
                    }`}
                  >
                    <Avatar
                      src={conv.participant.avatar}
                      name={conv.participant.name}
                      size="md"
                      showStatus={!conv.participant.isTeam}
                      status={conv.participant.status}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <p className="font-medium text-white truncate text-sm sm:text-base">{conv.participant.name}</p>
                        <span className="text-[10px] sm:text-xs text-[#64748b] flex-shrink-0 ml-2">{conv.lastMessage.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748b] truncate">{conv.lastMessage.text}</p>
                    </div>
                    {conv.lastMessage.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#22c55e] text-white text-xs flex items-center justify-center flex-shrink-0">
                        {conv.lastMessage.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-2 bg-[#0d1219] border border-[#1c2430] rounded-xl flex flex-col overflow-hidden h-full ${showChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#1c2430]">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Back button - mobile only */}
                    <button
                      onClick={handleBackToList}
                      className="lg:hidden p-2 -ml-2 text-[#64748b] hover:text-white hover:bg-[#141c28] rounded-lg transition-colors flex-shrink-0"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>

                    {activeConversation.participant.isTeam ? (
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-[#4ade80]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate text-sm sm:text-base">{activeConversation.participant.name}</p>
                          <p className="text-[10px] sm:text-xs text-[#64748b] uppercase tracking-wider">Team Chat</p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={`/players/${activeConversation.participant.id}`}
                        className="flex items-center gap-2 sm:gap-3 hover:bg-[#141c28] rounded-lg p-1 -m-1 transition-colors min-w-0"
                      >
                        <Avatar
                          src={activeConversation.participant.avatar}
                          name={activeConversation.participant.name}
                          size="md"
                          showStatus
                          status={activeConversation.participant.status}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-white hover:text-[#4ade80] transition-colors truncate text-sm sm:text-base">
                            {activeConversation.participant.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#64748b]">
                            {activeConversation.participant.status === 'online' ? (
                              <span className="text-[#22c55e]">Online</span>
                            ) : (
                              <span className="hidden sm:inline">Click to view profile</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button className="p-2 text-[#64748b] hover:text-white hover:bg-[#141c28] rounded-lg transition-colors hidden sm:block">
                      <FiInfo className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[#64748b] hover:text-white hover:bg-[#141c28] rounded-lg transition-colors">
                      <FiMoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loading size="md" text="Loading messages..." />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mb-4">
                        <FiMessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#64748b]" />
                      </div>
                      <p className="text-[#64748b] text-sm sm:text-base">No messages yet</p>
                      <p className="text-xs sm:text-sm text-[#4a5568]">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.senderId === user?._id || message.senderId === user?.id || message.senderId === 'me';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                              isMe
                                ? 'bg-[#1a5f2a] text-white rounded-br-sm border border-[#22c55e]/30'
                                : 'bg-[#141c28] text-white rounded-bl-sm border border-[#2a3a4d]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.text}</p>
                            <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${isMe ? 'text-[#4ade80]/70' : 'text-[#64748b]'}`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#1c2430]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      className="hidden sm:block p-2 text-[#64748b] hover:text-white hover:bg-[#141c28] rounded-lg transition-colors flex-shrink-0"
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#141c28] border border-[#2a3a4d] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 text-sm sm:text-base min-w-0"
                    />
                    <button
                      type="button"
                      className="hidden sm:block p-2 text-[#64748b] hover:text-white hover:bg-[#141c28] rounded-lg transition-colors flex-shrink-0"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="p-2.5 sm:p-3 bg-[#1a5f2a] text-[#4ade80] rounded-xl border border-[#22c55e]/30 hover:bg-[#22723a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <FiSend className={`w-4 h-4 sm:w-5 sm:h-5 ${isSending ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mb-4">
                  <FiSend className="w-8 h-8 sm:w-10 sm:h-10 text-[#64748b]" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-sm sm:text-base text-[#64748b]">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
