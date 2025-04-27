import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice'; // Importing the logout action from your Redux slice
import {
  MdDashboard,
  MdClass,
  MdPeople,
  MdAssignment,
  MdGrade,
  MdChat,
  MdAnnouncement,
  MdDescription,
  MdCalendarToday,
  MdPerson,
  MdSettings,
  MdExitToApp,
} from 'react-icons/md';

const TeacherSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isActive = (path) => location.pathname === path;

  // Menu Items
  const menuItems = {
    MAIN: [
      { icon: MdDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: MdClass, label: 'My Classes', path: '/teacher/classes' },
      { icon: MdPeople, label: 'Students', path: '/teacher/students' },
      { icon: MdAssignment, label: 'Assignments', path: '/teacher/assignments' },
      { icon: MdGrade, label: 'Grades', path: '/teacher/grades' },
    ],
    COMMUNICATION: [
      { icon: MdChat, label: 'Student Chat', path: '/teacher/chat' },
      { icon: MdAnnouncement, label: 'Announcements', path: '/teacher/announcements' },
    ],
    CONTENT: [
      { icon: MdDescription, label: 'Resources', path: '/teacher/resources' },
      
    ],
    ACCOUNT: [
      { icon: MdPerson, label: 'Profile', path: `/teacher/profile` },
     
      { icon: MdExitToApp, label: 'Logout', path: '#' }, // No path for logout, will trigger function
    ],
  };

  // Logout Handler
  const handleLogout = () => {
    dispatch(logout()); // Clear Redux auth state
    localStorage.removeItem('accessToken'); // Remove session tokens from localStorage
    navigate('/auth/teacher-login'); // Redirect to the teacher login page
  };

  // Render Menu Section
  const renderSection = (title, items) => (
    <div className="mb-8">
      <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return item.label === 'Logout' ? (
            <button
              key={item.path}
              onClick={handleLogout} // Trigger logout function on button click
              className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm ${isActive(item.path) ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Link to="/teacher/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-600">EduPortal</span>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4">
        {Object.entries(menuItems).map(([section, items]) => (
          <React.Fragment key={section}>
            {renderSection(section, items)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TeacherSideBar;
