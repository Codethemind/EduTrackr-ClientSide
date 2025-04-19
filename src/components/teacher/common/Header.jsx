import React, { useState } from 'react';
import { BiBell } from 'react-icons/bi';
import { FiSearch } from 'react-icons/fi';

const Header = () => {
  const [notifications] = useState([
    {
      id: 1,
      message: 'New submission from John Smith',
      time: '5 min ago',
    },
    {
      id: 2,
      message: 'Assignment deadline approaching',
      time: '10 min ago',
    },
  ]);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <BiBell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Emily Johnson</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">EJ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 