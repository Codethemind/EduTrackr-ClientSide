import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import axios from '../../api/axiosInstance';
import {
  MdNotifications,
  MdSearch,
  MdPerson,
  MdSettings,
  MdLogout,
  MdDashboard,
  MdMenu,
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { RootState } from '../../redux/store';

// Define prop types
interface HeaderProps {
  role: 'admin' | 'teacher' | 'student' | string;
  onMenuClick?: () => void;
}

// Define Profile data shape
interface ProfileData {
  name?: string;
  role?: string;
  avatar?: string;
  email?: string;
  profileImage?: string;
}

const Header: React.FC<HeaderProps> = ({ role, onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (user) {
          setProfileData({
            name: user.name,
            role: user.role || role,
            avatar: user.profileImage,
            email: user.email,
          });
        }

        const endpointMap: Record<string, string> = {
          admin: `/api/admins/${user?.id}`,
          teacher: `/api/teachers/${user?.id}`,
          student: `/api/students/${user?.id}`,
        };

        const endpoint = endpointMap[role] || `/api/admins/${user?.id}`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data?.name) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [role, accessToken, user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate(`/auth/${role}-login`);
  };

  const userName = profileData?.name || user?.username || 'User';
  const userRole = profileData?.role || user?.role || role || 'user';
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=0D8ABC&color=fff&size=256`;

  if (loading && !profileData) {
    return (
      <header className="flex justify-between items-center px-6 bg-white shadow-sm h-16">
        <div className="animate-pulse flex space-x-4 w-full">
          <div className="h-10 w-72 bg-gray-200 rounded-full"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full ml-auto"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-6 bg-white shadow-sm h-16 z-10 relative">
      {/* Left Section - Hamburger Menu for Mobile */}
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-500 hover:text-gray-700">
          <MdMenu size={24} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-5">
        {/* Notification Icon */}
        <button 
          className="relative text-gray-500 hover:text-gray-700"
          onClick={() => navigate(`/${role}/notifications`)}
        >
          <MdNotifications size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs justify-center items-center">
                {unreadCount}
              </span>
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex flex-col items-end mr-2">
              <span className="font-semibold text-sm text-gray-700 capitalize">{displayRole}</span>
              <span className="text-xs text-gray-500">{userName}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={profileData?.avatar || fallbackAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackAvatar;
                }}
              />
            </div>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 mr-3 shrink-0">
                    <img
                      src={profileData?.avatar || fallbackAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-sm text-gray-800 truncate">{userName}</div>
                    <div className="text-xs text-gray-500 truncate">{profileData?.email}</div>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={() => navigate(`/${role}/profile`)}
                >
                  <MdPerson className="mr-2" /> Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={() => navigate(`/${role}/dashboard`)}
                >
                  <MdDashboard className="mr-2" /> Dashboard
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                  onClick={handleLogout}
                >
                  <MdLogout className="mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
