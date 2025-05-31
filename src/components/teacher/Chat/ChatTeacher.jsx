import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Menu } from 'lucide-react';

const ChatTeacher = () => {
  const [message, setMessage] = useState('');
  const [activeStudentId, setActiveStudentId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const students = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: '👨‍🎓',
      lastMessage: 'Thank you for the explanation!',
      timestamp: '09:20 AM',
      unread: 0,
      online: true
    },
    {
      id: 2,
      name: 'Emma Davis',
      avatar: '👩‍🎓',
      lastMessage: 'Can we schedule a meeting?',
      timestamp: '08:45 AM',
      unread: 2,
      online: true
    },
    {
      id: 3,
      name: 'Michael Chen',
      avatar: '👨‍🎓',
      lastMessage: 'I submitted my assignment',
      timestamp: 'Yesterday',
      unread: 0,
      online: false
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      avatar: '👩‍🎓',
      lastMessage: 'Could you review my essay?',
      timestamp: 'Tuesday',
      unread: 1,
      online: false
    },
    {
      id: 5,
      name: 'David Brown',
      avatar: '👨‍🎓',
      lastMessage: 'Thanks for the feedback!',
      timestamp: 'Monday',
      unread: 0,
      online: true
    },
    {
      id: 6,
      name: 'Lisa Garcia',
      avatar: '👩‍🎓',
      lastMessage: 'When is the next class?',
      timestamp: 'Sunday',
      unread: 3,
      online: false
    }
  ];

  const conversations = {
    1: [
      {
        id: 1,
        sender: 'student',
        content: 'Good morning! I have a question about today\'s assignment.',
        timestamp: '09:15 AM',
        avatar: '👨‍🎓'
      },
      {
        id: 2,
        sender: 'teacher',
        content: 'Good morning! Of course, I\'m here to help. What specific part would you like to discuss?',
        timestamp: '09:16 AM',
        avatar: '👩‍🏫'
      },
      {
        id: 3,
        sender: 'student',
        content: 'I\'m having trouble understanding the concept of photosynthesis. Could you explain it in simpler terms?',
        timestamp: '09:18 AM',
        avatar: '👨‍🎓'
      },
      {
        id: 4,
        sender: 'teacher',
        content: 'Absolutely! Think of photosynthesis like cooking. Plants use sunlight as their "oven," carbon dioxide as one ingredient, and water as another. They mix these together to make their food (glucose) and release oxygen as a bonus! 🌱',
        timestamp: '09:20 AM',
        avatar: '👩‍🏫'
      }
    ],
    2: [
      {
        id: 1,
        sender: 'student',
        content: 'Hi! I was wondering if we could schedule a one-on-one meeting to discuss my progress?',
        timestamp: '08:40 AM',
        avatar: '👩‍🎓'
      },
      {
        id: 2,
        sender: 'student',
        content: 'I have some questions about the upcoming project requirements.',
        timestamp: '08:45 AM',
        avatar: '👩‍🎓'
      }
    ],
    3: [
      {
        id: 1,
        sender: 'student',
        content: 'I just submitted my math assignment. Please let me know if you need anything else.',
        timestamp: 'Yesterday',
        avatar: '👨‍🎓'
      }
    ]
  };

  const [allConversations, setAllConversations] = useState(conversations);
  const messagesEndRef = useRef(null);

  const activeStudent = students.find(s => s.id === activeStudentId);
  const currentMessages = allConversations[activeStudentId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, activeStudentId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: (currentMessages.length || 0) + 1,
        sender: 'teacher',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👩‍🏫'
      };
      
      setAllConversations(prev => ({
        ...prev,
        [activeStudentId]: [...(prev[activeStudentId] || []), newMessage]
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

  const switchToStudent = (studentId) => {
    setActiveStudentId(studentId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Students</h1>
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
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => switchToStudent(student.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeStudentId === student.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {student.avatar}
                  </div>
                  {student.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{student.timestamp}</span>
                      {student.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {student.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{student.lastMessage}</p>
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
              {activeStudent?.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeStudent?.name}</h2>
              <p className={`text-sm ${activeStudent?.online ? 'text-green-600' : 'text-gray-500'}`}>
                {activeStudent?.online ? '● Online' : '○ Offline'}
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
              className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender === 'teacher' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                  {msg.avatar}
                </div>
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.sender === 'teacher'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${msg.sender === 'teacher' ? 'text-right' : 'text-left'}`}>
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
                placeholder={`Message ${activeStudent?.name}...`}
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

export default ChatTeacher;