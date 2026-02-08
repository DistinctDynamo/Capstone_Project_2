import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiSend,
  FiMoreVertical,
  FiPaperclip,
  FiSmile,
  FiPhone,
  FiVideo,
  FiInfo,
} from 'react-icons/fi';
import { Card, Avatar, Loading, EmptyState, Input } from '../components/common';
import useAuthStore from '../store/authStore';
import { messagesAPI } from '../api';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await messagesAPI.getConversations();
        const conversationsData = response.data?.conversations || response.conversations || [];

        // Transform API data to match component expectations
        const transformedConversations = conversationsData.map(conv => {
          // Find the other participant (not the current user)
          const otherParticipant = conv.participants?.find(
            p => (p.user?._id || p.user || p._id) !== user?._id
          ) || conv.participants?.[0];

          const participant = otherParticipant?.user || otherParticipant;

          return {
            id: conv._id || conv.id,
            participant: {
              id: participant?._id || participant?.id,
              name: participant?.first_name
                ? `${participant.first_name} ${participant.last_name || ''}`.trim()
                : conv.name || participant?.name || 'Unknown',
              avatar: participant?.profile_image || null,
              status: participant?.is_online ? 'online' : 'offline',
              isTeam: conv.conversation_type === 'team' || conv.isTeam,
            },
            lastMessage: {
              text: conv.last_message?.content || conv.lastMessage?.text || 'No messages yet',
              time: conv.last_message?.createdAt
                ? formatMessageTime(conv.last_message.createdAt)
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

  // Helper function to format message time
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

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        loadMessages(conversationId);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
      loadMessages(conversations[0].id);
    }
  }, [conversationId, conversations]);

  const loadMessages = async (convId) => {
    try {
      setIsLoadingMessages(true);
      const response = await messagesAPI.getConversation(convId);
      const messagesData = response.data?.messages || response.messages || response.data?.conversation?.messages || [];

      // Transform API data to match component expectations
      const transformedMessages = messagesData.map(msg => ({
        id: msg._id || msg.id,
        senderId: msg.sender?._id || msg.sender || msg.senderId,
        text: msg.content || msg.text,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : msg.time || '',
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistically add the message to the UI
    const optimisticMsg = {
      id: Date.now(),
      senderId: user?._id || user?.id || 'me',
      text: messageContent,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await messagesAPI.sendMessage(activeConversation.id, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(messageContent); // Restore the message in the input
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        <span className="gradient-text">Messages</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dark-700">
            <Input
              placeholder="Search conversations..."
              leftIcon={<FiSearch size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-dark-400">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    loadMessages(conv.id);
                  }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-dark-800 transition-colors ${
                    activeConversation?.id === conv.id ? 'bg-dark-800' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar
                      src={conv.participant.avatar}
                      name={conv.participant.name}
                      size="md"
                    />
                    {!conv.participant.isTeam && (
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${
                          conv.participant.status === 'online'
                            ? 'bg-green-500'
                            : conv.participant.status === 'away'
                            ? 'bg-yellow-500'
                            : 'bg-dark-500'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white truncate">{conv.participant.name}</p>
                      <span className="text-xs text-dark-400">{conv.lastMessage.time}</span>
                    </div>
                    <p className="text-sm text-dark-400 truncate">{conv.lastMessage.text}</p>
                  </div>
                  {conv.lastMessage.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                      {conv.lastMessage.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={activeConversation.participant.avatar}
                    name={activeConversation.participant.name}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-white">{activeConversation.participant.name}</p>
                    <p className="text-sm text-dark-400">
                      {activeConversation.participant.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                    <FiVideo className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                    <FiInfo className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loading size="md" text="Loading messages..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-dark-400">
                    No messages yet. Start the conversation!
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
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-primary-500 text-white rounded-br-sm'
                              : 'bg-dark-800 text-white rounded-bl-sm'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-dark-400'}`}>
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
              <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-700">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <FiSmile className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <EmptyState
              icon={FiSend}
              title="Select a conversation"
              description="Choose a conversation from the list to start messaging."
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
