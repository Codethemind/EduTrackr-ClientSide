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
  MdDashboard
} from 'react-icons/md';

const Header = ({ role }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Get user from redux store
  const { user, accessToken } = useSelector((state) => state.auth);

  // Close dropdown when clicking outside
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

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // If we already have user data in Redux store, use it immediately
        // to prevent showing loading state
        if (user) {
          setProfileData({
            name: user.name,
            role: user.role || role,
            avatar: user.avatar,
            email: user.email
          });
        }
        
        let endpoint = '';
        
        // Determine endpoint based on role
        switch (role) {
          case 'admin':
            endpoint = '/api/admins/profile';
            break;
          case 'teacher':
            endpoint = '/api/teachers/profile';
            break;
          case 'student':
            endpoint = '/api/students/profile';
            break;
          default:
            endpoint = '/api/admins/profile';
        }

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        // Only update if we got valid data
        if (response.data && response.data.name) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        
        // Only set fallback data if we don't already have data
        if (!profileData && user) {
          setProfileData({
            name: user.name,
            role: user.role || role,
            avatar: user.avatar,
            email: user.email
          });
        }
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
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
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
    // Call logout action from Redux
    dispatch(logout());
    
    // Clear localStorage token
    localStorage.removeItem('accessToken');
    
    // Navigate to login page based on role
    navigate(`/auth/${role}-login`);
  };

  // Get user name from profile data or Redux store
  const userName = profileData?.name || user?.name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
  
  // Get user role - capitalize first letter
  const userRole = profileData?.role || role;
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  
  // Fallback avatar if no image is available
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
      {/* Search Section */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Results Dropdown */}
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

      {/* Right Side - Notifications and Profile */}
      <div className="flex items-center space-x-5">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <div className="p-2 rounded-full hover:bg-gray-100">
            <MdNotifications className="text-gray-600 text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="relative cursor-pointer">
          <div className="p-2 rounded-full hover:bg-gray-100">
            <MdMail className="text-gray-600 text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              5
            </span>
          </div>
        </div>

        {/* Profile Section */}
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
                src={profileData?.avatar || user?.avatar || fallbackAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackAvatar;
                }}
              />
            </div>
          </div>

          {/* Profile Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={profileData?.avatar || user?.avatar || fallbackAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAvatar;
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{userName}</div>
                    <div className="text-sm text-gray-500">{profileData?.email || user?.email}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate(`/${role}/dashboard`);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MdDashboard className="w-5 h-5 mr-2 text-gray-500" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  navigate(`/${role}/profile`);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MdPerson className="w-5 h-5 mr-2 text-gray-500" />
                My Profile
              </button>

              <button
                onClick={() => {
                  navigate(`/${role}/settings`);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MdSettings className="w-5 h-5 mr-2 text-gray-500" />
                Settings
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                <MdLogout className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 