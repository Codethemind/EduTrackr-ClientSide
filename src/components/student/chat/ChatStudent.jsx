import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Menu } from 'lucide-react';

const ChatStudent = () => {
  const [message, setMessage] = useState('');
  const [activeTeacherId, setActiveTeacherId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const teachers = [
    {
      id: 1,
      name: 'Mrs. Sarah Johnson',
      subject: 'Biology',
      avatar: '👩‍🏫',
      lastMessage: 'Great job on your assignment! Keep it up.',
      timestamp: '10:30 AM',
      unread: 1,
      online: true
    },
    {
      id: 2,
      name: 'Mr. David Wilson',
      subject: 'Mathematics',
      avatar: '👨‍🏫',
      lastMessage: 'Don\'t forget about tomorrow\'s quiz',
      timestamp: '09:15 AM',
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: 'Ms. Emily Davis',
      subject: 'English Literature',
      avatar: '👩‍🏫',
      lastMessage: 'Your essay shows great improvement!',
      timestamp: 'Yesterday',
      unread: 2,
      online: false
    },
    {
      id: 4,
      name: 'Mr. Michael Chen',
      subject: 'Physics',
      avatar: '👨‍🏫',
      lastMessage: 'Lab report deadline is Friday',
      timestamp: 'Tuesday',
      unread: 0,
      online: false
    },
    {
      id: 5,
      name: 'Mrs. Lisa Garcia',
      subject: 'Chemistry',
      avatar: '👩‍🏫',
      lastMessage: 'See you in class tomorrow',
      timestamp: 'Monday',
      unread: 3,
      online: true
    },
    {
      id: 6,
      name: 'Mr. Robert Brown',
      subject: 'History',
      avatar: '👨‍🏫',
      lastMessage: 'Research project guidelines sent',
      timestamp: 'Sunday',
      unread: 0,
      online: false
    }
  ];

  const conversations = {
    1: [
      {
        id: 1,
        sender: 'student',
        content: 'Hi Mrs. Johnson! I have a question about photosynthesis.',
        timestamp: '10:15 AM',
        avatar: '👨‍🎓'
      },
      {
        id: 2,
        sender: 'teacher',
        content: 'Of course! I\'d be happy to help. What specifically would you like to know?',
        timestamp: '10:18 AM',
        avatar: '👩‍🏫'
      },
      {
        id: 3,
        sender: 'student',
        content: 'I\'m confused about the light and dark reactions. How do they work together?',
        timestamp: '10:20 AM',
        avatar: '👨‍🎓'
      },
      {
        id: 4,
        sender: 'teacher',
        content: 'Great question! Think of it like a two-step dance. The light reactions capture energy from sunlight and store it, while the dark reactions use that stored energy to make glucose. They work as a team! 🌱',
        timestamp: '10:25 AM',
        avatar: '👩‍🏫'
      },
      {
        id: 5,
        sender: 'teacher',
        content: 'Great job on your assignment! Keep it up.',
        timestamp: '10:30 AM',
        avatar: '👩‍🏫'
      }
    ],
    2: [
      {
        id: 1,
        sender: 'teacher',
        content: 'Hi! Just a reminder about tomorrow\'s algebra quiz. Make sure to review chapters 5-7.',
        timestamp: '09:10 AM',
        avatar: '👨‍🏫'
      },
      {
        id: 2,
        sender: 'teacher',
        content: 'Don\'t forget about tomorrow\'s quiz',
        timestamp: '09:15 AM',
        avatar: '👨‍🏫'
      }
    ],
    3: [
      {
        id: 1,
        sender: 'teacher',
        content: 'I\'ve reviewed your latest essay on Shakespeare. Your analysis has improved significantly!',
        timestamp: 'Yesterday',
        avatar: '👩‍🏫'
      },
      {
        id: 2,
        sender: 'teacher',
        content: 'Your essay shows great improvement!',
        timestamp: 'Yesterday',
        avatar: '👩‍🏫'
      }
    ]
  };

  const [allConversations, setAllConversations] = useState(conversations);
  const messagesEndRef = useRef(null);

  const activeTeacher = teachers.find(t => t.id === activeTeacherId);
  const currentMessages = allConversations[activeTeacherId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, activeTeacherId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: (currentMessages.length || 0) + 1,
        sender: 'student',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👨‍🎓'
      };
      
      setAllConversations(prev => ({
        ...prev,
        [activeTeacherId]: [...(prev[activeTeacherId] || []), newMessage]
      }));
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const switchToTeacher = (teacherId) => {
    setActiveTeacherId(teacherId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Teachers</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => switchToTeacher(teacher.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeTeacherId === teacher.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {teacher.avatar}
                  </div>
                  {teacher.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate">{teacher.name}</p>
                      <p className="text-xs text-blue-600 truncate">{teacher.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{teacher.timestamp}</span>
                      {teacher.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {teacher.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{teacher.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
              {activeTeacher?.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeTeacher?.name}</h2>
              <p className="text-sm text-blue-600">{activeTeacher?.subject}</p>
              <p className={`text-xs ${activeTeacher?.online ? 'text-green-600' : 'text-gray-500'}`}>
                {activeTeacher?.online ? '● Online' : '○ Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender === 'student' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                  {msg.avatar}
                </div>
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.sender === 'student'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${msg.sender === 'student' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeTeacher?.name}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows="1"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`p-3 rounded-full transition-all ${
                message.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatStudent;