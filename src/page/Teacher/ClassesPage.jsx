import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const ClassesPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">My Classes</h1>
              <Link
                to="/teacher/my-classes/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Class
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <p className="text-gray-600">No classes found.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassesPage; 