import React from 'react';
import { useNavigate } from 'react-router-dom';

const TempPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Welcome to EduTrackr
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Please select your role to continue
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/auth/student-login')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Student Login
          </button>
          <button
            onClick={() => navigate('/auth/teacher-login')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Teacher Login
          </button>
          <button
            onClick={() => navigate('/auth/admin-login')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempPage;
