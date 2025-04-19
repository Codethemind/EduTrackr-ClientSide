import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBook, 
  MdAssignment, 
  MdGrade,
  MdLibraryBooks,
  MdMessage,
  MdAnnouncement,
  MdSmartToy,
  MdPerson,
  MdSettings,
  MdLogout 
} from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { section: 'MAIN', items: [
      { name: 'Dashboard', icon: <MdDashboard className="w-5 h-5" />, path: '/student/dashboard' },
      { name: 'My Courses', icon: <MdBook className="w-5 h-5" />, path: '/student/courses' },
      { name: 'Assignments', icon: <MdAssignment className="w-5 h-5" />, path: '/student/assignments' },
      { name: 'Grades', icon: <MdGrade className="w-5 h-5" />, path: '/student/grades' },
    ]},
    { section: 'RESOURCES', items: [
      { name: 'Course Materials', icon: <MdLibraryBooks className="w-5 h-5" />, path: '/student/materials' },
      { name: 'Library', icon: <MdBook className="w-5 h-5" />, path: '/student/library' },
      { name: 'Calendar', icon: <MdBook className="w-5 h-5" />, path: '/student/calendar' },
    ]},
    { section: 'COMMUNICATION', items: [
      { name: 'Messages', icon: <MdMessage className="w-5 h-5" />, path: '/student/messages' },
      { name: 'Announcements', icon: <MdAnnouncement className="w-5 h-5" />, path: '/student/announcements' },
      { name: 'AI Assistant', icon: <MdSmartToy className="w-5 h-5" />, path: '/student/ai-assistant' },
    ]},
    { section: 'ACCOUNT', items: [
      { name: 'Profile', icon: <MdPerson className="w-5 h-5" />, path: '/student/profile' },
      { name: 'Settings', icon: <MdSettings className="w-5 h-5" />, path: '/student/settings' },
      { name: 'Logout', icon: <MdLogout className="w-5 h-5" />, path: '/auth/student-login' },
    ]},
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-600">EduPortal</h1>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-6">
            <div className="px-6 mb-2">
              <h2 className="text-xs font-semibold text-gray-500">{section.section}</h2>
            </div>
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                to={item.path}
                className={`flex items-center px-6 py-2.5 text-sm ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 