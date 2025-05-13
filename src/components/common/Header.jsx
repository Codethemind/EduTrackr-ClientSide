// src/components/common/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import axios from '../../api/axiosInstance';
import {
  MdNotifications,
  MdMail,
  MdSearch,
  MdPerson,
  MdSettings,
  MdLogout,
  MdDashboard,
  MdMenu,
} from 'react-icons/md';

const Header = ({ role, onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        let endpoint = '';
        switch (role) {
          case 'admin': endpoint = '/api/admins/profile'; break;
          case 'teacher': endpoint = '/api/teachers/profile'; break;
          case 'student': endpoint = '/api/students/profile'; break;
          default: endpoint = '/api/admins/profile';
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data?.name) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [role, accessToken, user]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await axios.get(`/api/search?q=${query}&role=${role}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSearchResults(response.data || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate(`/auth/${role}-login`);
  };

  const userName = profileData?.name || user?.username || "User";
  const userRole = profileData?.role || user?.role || role || "user";
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&size=256`;

  if (loading && !profileData) {
    return (
      <header className="flex justify-between items-center px-6 bg-white shadow-sm h-16">
        <div className="animate-pulse flex space-x-4">
          <div className="h-10 w-72 bg-gray-200 rounded-full"></div>
          <div className="flex-1"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-6 bg-white shadow-sm h-16">
      {/* Left - Menu & Search */}
      <div className="flex items-center">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="lg:hidden mr-4 text-gray-500 hover:text-gray-700">
            <MdMenu size={24} />
          </button>
        )}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-10 border border-gray-100">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setShowSearchResults(false);
                    navigate(`/${role}/${result.id}`);
                  }}
                >
                  <div className="font-medium text-gray-800">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Notifications & Profile */}
      <div className="flex items-center space-x-5">
        <div className="relative cursor-pointer">
          <div className="p-2 rounded-full hover:bg-gray-100">
            <MdNotifications className="text-gray-600 text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </div>
        </div>
        <div className="relative cursor-pointer">
          <div className="p-2 rounded-full hover:bg-gray-100">
            <MdMail className="text-gray-600 text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">5</span>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="flex flex-col items-end mr-2">
              <span className="font-semibold text-sm text-gray-700 capitalize">{displayRole}</span>
              <span className="text-xs text-gray-500">{userName}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={profileData?.avatar || fallbackAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
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
                {/* <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={() => navigate(`/${role}/settings`)}
                >
                  <MdSettings className="mr-2" /> Settings
                </button> */}
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
