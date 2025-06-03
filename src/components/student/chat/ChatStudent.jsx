import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Send, Paperclip, Smile, Search, Menu, MoreVertical, Trash2 } from 'lucide-react';
import axios from '../../../api/axiosInstance';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Backend configuration
const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

const ChatStudent = () => {
  const authState = useSelector((state) => state.auth);
  const userId = authState?.user?._id || authState?.user?.id;
  const departmentId = authState?.user?.departmentId;
  const accessToken = authState?.accessToken;
  const userModel = 'Student';

  const [message, setMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatList, setChatList] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  // Validate auth data
  useEffect(() => {
    if (!userId || !accessToken || !departmentId) {
      console.error('Missing auth data:', { userId, accessToken, departmentId });
      setError('Please log in and ensure department information is available');
      toast.error('Authentication or department information missing');
      setLoading(false);
    }
  }, [userId, accessToken, departmentId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!userId || !accessToken) return;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: accessToken,
        userId,
        userModel
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      setError('');
      // Join user's room
      socketRef.current.emit('join', { userId, userModel });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
      setError('Failed to connect to real-time messaging');
      toast.error('Connection failed. Messages may not be real-time.');
    });

    socketRef.current.on('receiveMessage', (newMessage) => {
      console.log('Received message:', newMessage);
      if (newMessage.chatId === activeChatId) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === newMessage._id);
          if (!messageExists) {
            return [...prev, newMessage];
          }
          return prev;
        });
        scrollToBottom();
      }
      updateChatList(newMessage);
    });

    socketRef.current.on('messageReaction', (updatedMessage) => {
      console.log('Message reaction:', updatedMessage);
      if (updatedMessage.chatId === activeChatId) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === updatedMessage._id ? { ...msg, reactions: updatedMessage.reactions } : msg
          )
        );
      }
    });

    socketRef.current.on('messageDeleted', (deletedMessage) => {
      console.log('Message deleted:', deletedMessage);
      if (deletedMessage.chatId === activeChatId) {
        setMessages(prev => prev.filter(msg => msg._id !== deletedMessage._id));
      }
      fetchChatList();
    });

    socketRef.current.on('newChat', ({ chatId, contact, contactModel }) => {
      console.log('New chat:', { chatId, contact, contactModel });
      fetchChatList();
      if (contactModel === 'Teacher') {
        setActiveChatId(chatId);
        setActiveTeacher({
          id: contact,
          name: teachers.find(t => t._id === contact)?.name || 'Teacher'
        });
      }
    });

    socketRef.current.on('messageSent', (sentMessage) => {
      console.log('Message sent:', sentMessage);
      if (sentMessage.chatId === activeChatId) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === sentMessage._id);
          if (!messageExists) {
            return [...prev, sentMessage];
          }
          return prev;
        });
        scrollToBottom();
      }
      updateChatList(sentMessage);
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
      setError('Real-time messaging error');
      toast.error(err.message || 'Socket error');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, accessToken]);

  // Update chat list with new message
  const updateChatList = (message) => {
    setChatList(prev => {
      if (!prev) return prev;
      const updatedChats = prev.chats.map(chat =>
        chat.chatId === message.chatId
          ? {
              ...chat,
              lastMessage: message.message || message.mediaUrl || '',
              timestamp: message.timestamp || new Date().toISOString()
            }
          : chat
      );
      return { ...prev, chats: updatedChats };
    });
  };

  // Fetch teachers by department
  const fetchTeachers = async () => {
    if (!departmentId || !accessToken) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const filteredTeachers = response.data.data.filter(
        teacher => teacher.department === departmentId
      );
      setTeachers(filteredTeachers);
      setError('');
    } catch (err) {
      console.error('Fetch teachers error:', err);
      setError('Failed to fetch teachers');
      toast.error(err.response?.data?.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat list
  const fetchChatList = async () => {
    if (!userId || !accessToken) return;

    try {
      const response = await axios.get(`${API_URL}/messages/chatlist`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setChatList(response.data.data);
      setError('');
    } catch (err) {
      console.error('Fetch chat list error:', err);
      setError('Failed to fetch chat list');
      toast.error(err.response?.data?.message || 'Failed to fetch chat list');
    }
  };

  // Fetch messages for active chat
  const fetchMessages = async (chatId) => {
    if (!chatId || !accessToken) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messages/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setMessages(response.data.data || []);
      setError('');
      scrollToBottom();
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError('Failed to fetch messages');
      toast.error(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId && accessToken && departmentId) {
      fetchTeachers();
      fetchChatList();
    }
  }, [userId, accessToken, departmentId]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!activeChatId || !activeTeacher || !accessToken || (!message.trim() && !file)) return;

    const messageText = message.trim();
    setMessage('');
    setFile(null);
    setReplyTo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (socketRef.current && socketConnected) {
      if (file) {
        const formData = new FormData();
        formData.append('media', file);
        try {
          const uploadResponse = await axios.post(`${API_URL}/messages/upload`, formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          const mediaUrl = uploadResponse.data.data.url;

          socketRef.current.emit('sendMedia', {
            chatId: activeChatId,
            receiver: activeTeacher.id,
            receiverModel: 'Teacher',
            message: messageText,
            mediaUrl,
            replyTo: replyTo?._id
          }, (response) => {
            if (response.error) {
              console.error('Socket sendMedia error:', response.error);
              toast.error(response.error);
              setMessage(messageText);
            }
          });
        } catch (err) {
          console.error('Upload error:', err);
          toast.error(err.response?.data?.message || 'Failed to upload media');
          setMessage(messageText);
        }
      } else {
        socketRef.current.emit('sendMessage', {
          chatId: activeChatId,
          receiver: activeTeacher.id,
          receiverModel: 'Teacher',
          message: messageText,
          replyTo: replyTo?._id
        }, (response) => {
          if (response.error) {
            console.error('Socket sendMessage error:', response.error);
            toast.error(response.error);
            setMessage(messageText);
          }
        });
      }
    } else {
      // Fallback to HTTP if socket is not connected
      const formData = new FormData();
      formData.append('chatId', activeChatId);
      formData.append('sender', userId);
      formData.append('senderModel', userModel);
      formData.append('receiver', activeTeacher.id);
      formData.append('receiverModel', 'Teacher');
      if (messageText) formData.append('message', messageText);
      if (replyTo) formData.append('replyTo', replyTo._id);
      if (file) formData.append('media', file);

      try {
        const response = await axios.post(`${API_URL}/messages/send`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessages(prev => [...prev, response.data.data]);
        updateChatList(response.data.data);
        scrollToBottom();
      } catch (err) {
        console.error('Send message error:', err);
        setError('Failed to send message');
        toast.error(err.response?.data?.message || 'Failed to send message');
        setMessage(messageText);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddReaction = async (messageId, reaction) => {
    if (!socketConnected) {
      try {
        await axios.post(
          `${API_URL}/messages/reaction`,
          { messageId, userId, reaction },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add reaction');
      }
    } else {
      socketRef.current.emit('addReaction', { messageId, reaction });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!socketConnected) {
      try {
        await axios.post(
          `${API_URL}/messages/delete`,
          { messageId, userId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        fetchChatList();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete message');
      }
    } else {
      socketRef.current.emit('deleteMessage', { messageId });
    }
  };

  const initiateChat = async (teacherId) => {
    if (!userId || !accessToken) {
      setError('Authentication required');
      toast.error('Please log in to start a chat');
      return;
    }

    // Validate ObjectIds using regex
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId(teacherId) || !isValidObjectId(userId)) {
      setError('Invalid teacher or student ID');
      toast.error('Invalid teacher or student ID');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/messages/initiate`,
        { teacherId, studentId: userId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const { chatId } = response.data.data;
      await fetchChatList();
      setActiveChatId(chatId);
      setActiveTeacher({
        id: teacherId,
        name: teachers.find((t) => t._id === teacherId)?.name || 'Teacher',
      });
      toast.success('Chat initiated successfully');
    } catch (err) {
      console.error('Initiate chat error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to initiate chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const switchToTeacher = (chatId, teacher) => {
    setActiveChatId(chatId);
    setActiveTeacher(teacher);
  };

  if (!userId || !accessToken || !departmentId) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Please log in and ensure department information is available</p>
          <p className="text-sm text-gray-500">Missing: {!userId && 'User ID'} {!accessToken && 'Access Token'} {!departmentId && 'Department ID'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Teachers</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'} />
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search teachers..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {loading && <p className="p-4 text-gray-600">Loading...</p>}
          {error && <p className="p-4 text-red-600 text-sm">{error}</p>}
          {!loading && teachers.length > 0 && (
            <>
              <h2 className="p-4 font-semibold text-gray-900">Available Teachers</h2>
              {teachers.map((teacher) => (
                <div key={teacher.id} onClick={() => initiateChat(teacher.id)} className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">👩‍🏫</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{teacher.name}</p>
                      <p className="text-xs text-blue-600 truncate">Teacher</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {!loading && !error && teachers.length === 0 && <p className="p-4 text-gray-600">No teachers available in your department</p>}
          {!loading && chatList?.chats?.length > 0 && (
            <>
              <h2 className="p-4 font-semibold text-gray-900">Recent Chats</h2>
              {chatList.chats.map((chat) => (
                <div key={chat.chatId} onClick={() => switchToTeacher(chat.chatId, { id: chat.contact._id, name: chat.contact.name })} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeChatId === chat.chatId ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">👩‍🏫</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{chat.contact.name}</p>
                          <p className="text-xs text-blue-600 truncate">Teacher</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">👩‍🏫</div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeTeacher?.name || 'Select a teacher'}</h2>
              <p className="text-sm text-blue-600">
                Teacher {socketConnected && <span className="text-green-500">• Online</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading && <p className="text-center text-gray-600">Loading messages...</p>}
          {error && <p className="text-center text-red-600 text-sm">{error}</p>}
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender === userId ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">{msg.senderModel === 'Student' ? '👨‍🎓' : '👩‍🏫'}</div>
                  <div>
                    {msg.replyTo && (
                      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded-t-md">
                        Replying to: {msg.replyTo.message || 'Media'}
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${msg.sender === userId ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'}`}>
                      {msg.isDeleted ? (
                        <p className="text-sm italic">Message deleted</p>
                      ) : (
                        <>
                          {msg.message && <p className="text-sm">{msg.message}</p>}
                          {msg.mediaUrl && (
                            <div className="mt-2">
                              {msg.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={msg.mediaUrl} alt="Media" className="max-w-full rounded-md" style={{ maxHeight: '200px' }} />
                              ) : (
                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                  View File
                                </a>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <p className={`text-xs text-gray-500 ${msg.sender === userId ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {!msg.isDeleted && (
                        <>
                          <select onChange={(e) => handleAddReaction(msg._id, e.target.value)} value="" className="text-sm">
                            <option value="" disabled>React</option>
                            {['❤️', '😂', '😢', '💯', '👍', '👎'].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <div className="flex space-x-1">
                            {msg.reactions?.map((r, i) => (
                              <span key={i} className="text-sm">{r.reaction}</span>
                            ))}
                          </div>
                          {msg.sender === userId && (
                            <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setReplyTo(msg)} className="text-blue-500 hover:text-blue-700 text-sm">Reply</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && !error && activeChatId && <p className="text-center text-gray-600">No messages yet. Start the conversation!</p>
          )}
          {!activeChatId && !loading && (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-4">💬</div>
              <p>Select a teacher to start chatting</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          {replyTo && (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
              <span className="text-sm text-gray-600">Replying to: {replyTo.message || 'Media'}</span>
              <button onClick={() => setReplyTo(null)} className="text-red-500 hover:text-red-700">Cancel</button>
            </div>
          )}
          <div className="flex items-end space-x-3">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeTeacher?.name || 'teacher'}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows="1"
                style={{ minHeight: '48px' }}
                disabled={!activeChatId}
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !file) || !activeChatId}
              className={`p-3 rounded-full transition-all ${message.trim() || file ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {!socketConnected && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Real-time messaging unavailable. Messages will be sent via HTTP.
            </p>
          )}
          {file && <p className="text-xs text-gray-600 mt-2">Selected file: {file.name}</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatStudent;