
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, Smile, Search, Menu, MoreVertical, Trash2 } from 'lucide-react';
import axios from '../../../api/axiosInstance';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Backend configuration
const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

// Module-level socket instance
let socket = null;

const ChatTeacher = () => {
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);
  const userId = authState?.user?._id || authState?.user?.id;
  const teacherDepartmentId = authState?.user?.departmentId;
  const accessToken = authState?.accessToken;
  const userModel = 'Teacher';

  const [message, setMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatList, setChatList] = useState(null);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [typingStatus, setTypingStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const reactionEmojis = ['❤️', '😂', '😢', '💯', '👍', '👎'];
  let typingTimeout = null;

  // Validate auth data
  useEffect(() => {
    if (!userId || !accessToken || !teacherDepartmentId) {
      setError('Please log in and ensure department information is available');
      toast.error('Authentication or department information missing');
      setLoading(false);
      navigate('/login');
    }
  }, [userId, accessToken, teacherDepartmentId, navigate]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    const messagesEnd = document.getElementById('messages-end');
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!userId || !accessToken) return;

    // Cleanup existing socket
    if (socket) {
      console.log('Cleaning up existing socket');
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    console.log('Initializing new socket connection');
    socket = io(SOCKET_URL, {
      auth: { token: accessToken, userId, userModel },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setSocketConnected(true);
      setError('');
      socket.emit('join', { userId, userModel });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setSocketConnected(false);
      if (reason !== 'io client disconnect') {
        toast.error('Real-time messaging disconnected', {
          style: { background: '#fefcbf', color: '#b45309' },
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setSocketConnected(false);
      setError('Failed to connect to real-time messaging');
      toast.error(`Connection failed: ${err.message}`);
    });

    socket.on('receiveMessage', (newMessage) => {
      console.log('📨 Received message:', newMessage);
      if (!newMessage._id && !newMessage.id) {
        console.error('Received message without ID:', newMessage);
        return;
      }

      const messageId = newMessage._id || newMessage.id;
      const normalizedMessage = { ...newMessage, _id: messageId, sender: String(newMessage.sender) };

      if (normalizedMessage.chatId === activeChatId) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg._id === messageId || msg.id === messageId
          );
          if (!messageExists) {
            console.log('✅ Adding new message to state');
            return [...prevMessages, normalizedMessage];
          }
          console.log('⚠️ Message already exists, skipping');
          return prevMessages;
        });
      }

      updateChatList(normalizedMessage);
      if (String(normalizedMessage.sender) !== userId) {
        emitNotification('message', activeStudent?.id, {
          sender: activeStudent?.name || 'Student',
          message: normalizedMessage.message || 'sent a message',
        });
      }
    });

    socket.on('messageReaction', (updatedMessage) => {
      console.log('👍 Message reaction:', updatedMessage);
      if (updatedMessage.chatId === activeChatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            (msg._id === updatedMessage._id || msg.id === updatedMessage.id)
              ? { ...msg, reactions: updatedMessage.reactions }
              : msg
          )
        );
      }
    });

    socket.on('messageDeleted', (deletedMessage) => {
      console.log('🗑️ Message deleted:', deletedMessage);
      if (deletedMessage.chatId === activeChatId) {
        const messageId = deletedMessage._id || deletedMessage.id;
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId && msg.id !== messageId)
        );
      }
      fetchChatList();
    });

    socket.on('newChat', ({ chatId, contact, contactModel }) => {
      console.log('💬 New chat:', { chatId, contact, contactModel });
      fetchChatList();
      if (contactModel === 'Student') {
        setActiveChatId(chatId);
        setActiveStudent({
          id: contact,
          name: students.find((s) => s._id === contact)?.name || 'Student',
        });
      }
    });

    socket.on('typing', ({ userId: typingUserId, isTyping: isUserTyping, chatId }) => {
      if (String(typingUserId) !== userId && chatId === activeChatId) {
        setTypingStatus(isUserTyping);
      }
    });

    socket.on('error', (err) => {
      console.error('❌ Socket error:', err);
      setError('Real-time messaging error');
      toast.error(err.message || 'Socket error');
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
    };
  }, [userId, accessToken, activeChatId, students]);

  // Update chat list
  const updateChatList = (message) => {
    setChatList((prev) => {
      if (!prev) return prev;
      const updatedChats = prev.chats.map((chat) =>
        chat.chatId === message.chatId
          ? {
              ...chat,
              lastMessage: message.message || message.mediaUrl || '',
              timestamp: message.timestamp || new Date().toISOString(),
            }
          : chat
      );
      return { ...prev, chats: updatedChats };
    });
  };

  // Fetch students in department
  const fetchStudentsInDepartment = async () => {
    if (!userId || !accessToken || !teacherDepartmentId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const departmentStudents = (response.data.data || response.data || []).filter(
        (student) => student.departmentId === teacherDepartmentId
      );
      setStudents(departmentStudents);
      setError('');
    } catch (err) {
      console.error('Fetch students error:', err);
      setError('Failed to fetch students');
      toast.error(err.response?.data?.message || 'Failed to fetch students');
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
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setChatList(response.data.data);
      setError('');
    } catch (err) {
      console.error('Fetch chat list error:', err);
      setError('Failed to fetch chat list');
      toast.error(err.response?.data?.message || 'Failed to fetch chat list');
    }
  };

  // Fetch messages
  const fetchMessages = async (chatId) => {
    if (!chatId || !accessToken) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messages/${chatId}`, {
        params: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const normalizedMessages = (response.data.data || []).map((msg) => {
        // Normalize sender to handle object or string
        const senderId = typeof msg.sender === 'object' && msg.sender?._id 
          ? msg.sender._id 
          : msg.senderId || msg.sender;
        console.log(`Message sender: ${senderId}, userId: ${userId}`); // Debug log
        return {
          ...msg,
          _id: msg._id || msg.id,
          sender: String(senderId),
        };
      });
      setMessages(normalizedMessages);
      setError('');
      setTimeout(scrollToBottom, 100);
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
    if (userId && accessToken && teacherDepartmentId) {
      console.log(`Initial fetch with userId: ${userId}`); // Debug log
      fetchStudentsInDepartment();
      fetchChatList();
    }
  }, [userId, accessToken, teacherDepartmentId]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX');
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);
  };

  // Trigger file input
  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  // Emit notification
  const emitNotification = async (type, userId, message) => {
    try {
      await axios.post(
        `${API_URL}/notifications/create`,
        { type, message, role: 'student', userId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!isTyping && activeChatId && socketConnected) {
      setIsTyping(true);
      socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: true });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      if (socketConnected) {
        socket?.emit('typing', { chatId: activeChatId, sender: userId, isTyping: false });
      }
    }, 2000);
  };

  // Handle add reaction
  const handleAddReaction = async (messageId, reaction) => {
    if (!messageId || !reaction) {
      toast.error('Missing required fields for reaction');
      return;
    }

    try {
      if (socketConnected && socket) {
        socket.emit(
          'addReaction',
          { messageId, reaction, userId, senderModel: 'Teacher' },
          (response) => {
            if (response?.error) {
              toast.error(response.error);
            } else {
              emitNotification('reaction', activeStudent?.id, {
                sender: userId,
                reaction,
              });
            }
          }
        );
      } else {
        const response = await axios.post(
          `${API_URL}/messages/reaction`,
          { messageId: messageId, sender: userId, reaction, senderModel: 'Teacher' },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (response.data.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              (msg._id === messageId || msg.id === messageId)
                ? { ...msg, reactions: [...(msg.reactions || []), { reaction, userId }] }
                : msg
            )
          );
          emitNotification('reaction', activeStudent?.id, {
            sender: userId,
            reaction,
          });
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
      toast.error(err.response?.data?.message || 'Failed to add reaction');
    } finally {
      setShowReactionPicker(null);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!activeChatId || !activeStudent || !accessToken || (!message.trim() && !file)) {
      console.log('Cannot send message - missing requirements');
      return;
    }

    const messageText = message.trim();
    setMessage('');
    setFile(null);
    setReplyTo(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';

    try {
      if (socketConnected && socket) {
        console.log('📤 Sending message via socket');
        if (file) {
          const formData = new FormData();
          formData.append('media', file);
          setIsUploading(true);
          setUploadProgress(0);

          try {
            const uploadResponse = await axios.post(`${API_URL}/messages/upload`, formData, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            });

            if (!uploadResponse.data?.data?.url) {
              throw new Error('Failed to upload file');
            }

            const mediaUrl = uploadResponse.data.data.url;
            const mediaType = file.type.startsWith('image/') ? 'image' : 'document';

            socket.emit(
              'sendMedia',
              {
                chatId: activeChatId,
                sender: userId,
                senderModel: 'Teacher',
                receiver: activeStudent.id,
                receiverModel: 'Student',
                message: messageText,
                mediaUrl,
                mediaType,
                replyTo: replyTo?._id,
              },
              (response) => {
                if (response?.error) {
                  console.error('Socket sendMedia error:', response.error);
                  toast.error(response.error);
                  setMessage(messageText);
                } else {
                  console.log('✅ Media sent successfully via socket');
                  emitNotification('media', activeStudent?.id, `shared a ${mediaType}`);
                }
              }
            );
          } catch (err) {
            console.error('Upload error:', err);
            toast.error(err.response?.data?.message || 'Failed to upload media');
            setMessage(messageText);
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        } else {
          socket.emit(
            'sendMessage',
            {
              chatId: activeChatId,
              sender: userId,
              senderModel: 'Teacher',
              receiver: activeStudent.id,
              receiverModel: 'Student',
              message: messageText,
              replyTo: replyTo?._id,
            },
            (response) => {
              if (response?.error) {
                console.error('Socket sendMessage error:', response.error);
                toast.error(response.error);
                setMessage(messageText);
              } else {
                console.log('✅ Message sent successfully via socket');
                if (replyTo) {
                  emitNotification('reply', activeStudent?.id, 'replied to your message');
                }
              }
            }
          );
        }
      } else {
        console.log('📤 Sending message via HTTP (socket not connected)');
        const formData = new FormData();
        formData.append('chatId', activeChatId);
        formData.append('sender', userId);
        formData.append('senderModel', 'Teacher');
        formData.append('receiver', activeStudent.id);
        formData.append('receiverModel', 'Student');
        if (messageText) formData.append('message', messageText);
        if (replyTo) formData.append('replyTo', replyTo._id);
        if (file) {
          formData.append('media', file);
          formData.append('mediaType', file.type.startsWith('image/') ? 'image' : 'document');
        }

        setIsUploading(true);
        setUploadProgress(0);
        const response = await axios.post(`${API_URL}/messages/send`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        if (response.data.success) {
          const newMessage = {
            ...response.data.data,
            _id: response.data.data._id || response.data.data.id,
            sender: String(response.data.data.sender || userId),
          };
          setMessages((prev) => [...prev, newMessage]);
          updateChatList(newMessage);
          scrollToBottom();
          console.log('✅ Message sent successfully via HTTP');
          if (replyTo) {
            emitNotification('reply', activeStudent?.id, 'replied to your message');
          }
        } else {
          throw new Error(response.data.message || 'Failed to send message');
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
      toast.error(err.response?.data?.message || 'Failed to send message');
      setMessage(messageText);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      if (socketConnected && socket) {
        socket.emit('deleteMessage', { messageId }, (response) => {
          if (response?.error) {
            console.error('Socket deleteMessage error:', response.error);
            toast.error(response.error);
          }
        });
      } else {
        await axios.post(
          `${API_URL}/messages/delete`,
          { messageId, userId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId && msg.id !== messageId)
        );
        fetchChatList();
      }
    } catch (err) {
      console.error('Delete message error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  // Validate MongoDB ObjectId
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Initiate chat
  const initiateChat = async (studentId) => {
    if (!userId || !accessToken) {
      setError('Authentication required');
      toast.error('Please log in to start a chat');
      return;
    }

    if (!isValidObjectId(studentId) || !isValidObjectId(userId)) {
      setError('Invalid teacher or student ID');
      toast.error('Invalid teacher or student ID');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/messages/initiate`,
        { teacherId: userId, studentId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const { chatId } = response.data.data;
      await fetchChatList();
      setActiveChatId(chatId);
      setActiveStudent({
        id: studentId,
        name: students.find((s) => s._id === studentId)?.name || 'Student',
      });
      toast.success('Chat initiated successfully');
    } catch (err) {
      console.error('Initiate chat error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to initiate chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Switch to student
  const switchToStudent = (chatId, student) => {
    setActiveChatId(chatId);
    setActiveStudent(student);
  };

  // Message actions component
  const MessageActions = ({ message }) => (
    <div className="flex items-center space-x-2 mt-1">
      <div className="relative">
        <button
          onClick={() =>
            setShowReactionPicker(
              showReactionPicker === (message._id || message.id)
                ? null
                : message._id || message.id
            )
          }
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          React
        </button>
        {showReactionPicker === (message._id || message.id) && (
          <div className="absolute bottom-full left-0 mb-3 w-64 bg-white rounded-xl shadow-lg p-1 border border-gray-300 z-50">
            <div className="grid grid-cols-6 gap-3 justify-items-center">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddReaction(message._id || message.id, emoji)}
                  className="text-xl p-1 hover:bg-gray-100 rounded-full transition duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => setReplyTo(message)}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        Reply
      </button>
      {String(message.sender) === userId && (
        <button
          onClick={() => handleDeleteMessage(message._id || message.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // Render message
  const renderMessage = (msg) => {
    const messageId = msg._id || msg.id;
    const messageKey = `message-${messageId}-${msg.timestamp}`;
    // Debug sender comparison
    console.log(`Rendering message ${messageId}: sender=${msg.sender}, userId=${userId}, isSender=${String(msg.sender) === userId}`);
    const isSender = String(msg.sender) === userId;

    return (
      <div
        key={messageKey}
        className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
            isSender ? 'flex-row-reverse space-x-reverse' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
            {msg.senderModel === 'Student' ? '👨‍🎓' : '👩‍🏫'}
          </div>
          <div>
            {msg.replyTo && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded-t-md mb-1">
                <div className="font-medium">
                  {msg.replyTo.senderModel === 'Student' ? '👨‍🎓' : '👩‍🏫'}{' '}
                  {String(msg.replyTo.sender) === userId ? 'You' : activeStudent?.name}
                </div>
                <div className="truncate">
                  {msg.replyTo.message || (msg.replyTo.mediaUrl ? 'Media' : '')}
                </div>
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isSender
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
              }`}
            >
              {msg.isDeleted ? (
                <p className="text-sm italic">Message deleted</p>
              ) : (
                <>
                  {msg.message && <p className="text-sm">{msg.message}</p>}
                  {msg.mediaUrl && (
                    <div className="mt-2">
                      {msg.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={msg.mediaUrl}
                          alt="Media"
                          className="max-w-full rounded-md"
                          style={{ maxHeight: '200px' }}
                        />
                      ) : (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center mt-1 space-x-2">
              <p
                className={`text-xs text-gray-500 ${
                  isSender ? 'text-right' : 'text-left'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {!msg.isDeleted && (
                <>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                      {msg.reactions.map((r, i) => (
                        <span key={`reaction-${i}`} className="text-sm">
                          {r.reaction}
                        </span>
                      ))}
                    </div>
                  )}
                  <MessageActions message={msg} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!userId || !accessToken || !teacherDepartmentId) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">
            Please log in and ensure department information is available
          </p>
          <p className="text-sm text-gray-500">
            Missing: {!userId && 'User ID'} {!accessToken && 'Access Token'}{' '}
            {!teacherDepartmentId && 'Department ID'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Students</h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={socketConnected ? 'Connected' : 'Disconnected'}
              />
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {loading && <p className="p-4 text-gray-600">Loading...</p>}
          {error && <p className="p-4 text-red-600 text-sm">{error}</p>}
          {!loading && students.length > 0 && (
            <div>
              <h2 className="p-4 font-semibold text-gray-900">Available Students</h2>
              {students.map((student) => (
                <div
                  key={student._id || student.id}
                  onClick={() => initiateChat(student._id || student.id)}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      👨‍🎓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{student.name || student.username}</p>
                      <p className="text-xs text-blue-600 truncate">Student</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && students.length === 0 && (
            <p className="p-4 text-gray-600">No students available in your department</p>
          )}
          {!loading && chatList?.chats?.length > 0 && (
            <div>
              <h2 className="p-4 font-semibold text-gray-900">Recent Chats</h2>
              {chatList.chats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() =>
                    switchToStudent(chat.chatId, { id: chat.contact._id, name: chat.contact.name })
                  }
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeChatId === chat.chatId ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      👨‍🎓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{chat.contact.name}</p>
                          <p className="text-xs text-blue-600 truncate">Student</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
              👨‍🎓
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeStudent?.name || 'Select a student'}</h2>
              <p className="text-sm text-blue-600">
                Student{' '}
                {socketConnected && typingStatus
                  ? ' • Typing...'
                  : socketConnected
                  ? ' • Online'
                  : ' • Offline'}
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
          {loading && <p className="text-center text-gray-600">Loading messages...</p>}
          {error && <p className="text-center text-red-600 text-sm">{error}</p>}
          {messages.length > 0 ? (
            messages.map(renderMessage)
          ) : (
            !loading &&
            !error &&
            activeChatId && (
              <p className="text-center text-gray-600">No messages yet. Start the conversation!</p>
            )
          )}
          {typingStatus && (
            <div className="text-sm italic text-gray-500">
              {activeStudent?.name || 'Student'} is typing...
            </div>
          )}
          {!activeChatId && !loading && !error && (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-4">
                💬
              </div>
              <p>Select a student to start chatting</p>
            </div>
          )}
          <div id="messages-end" />
        </div>
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          {replyTo && (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
              <span className="text-sm text-gray-600">
                Replying to: {replyTo.message || 'Media'}
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-red-500 hover:text-red-700"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-end space-x-3">
            <button
              onClick={triggerFileInput}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              disabled={isUploading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeStudent?.name || 'student'}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows="1"
                style={{ minHeight: '48px' }}
                disabled={!activeChatId || isUploading}
              />
            </div>
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              disabled={isUploading}
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !file) || !activeChatId || isUploading}
              className={`p-3 rounded-full transition-all duration-200 ${
                (message.trim() || file) && !isUploading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
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
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Uploading: ${uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTeacher;
