import React from 'react';
import { MdNotifications, MdSearch } from 'react-icons/md';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 h-16 z-30">
      <div className="px-6 h-full flex items-center justify-between">
        {/* Search Bar */}
        <div className="w-96">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <MdNotifications className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              AJ
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Alex Johnson</p>
              <p className="text-gray-500 text-xs">Student</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 