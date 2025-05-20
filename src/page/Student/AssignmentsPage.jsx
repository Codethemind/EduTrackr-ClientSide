import React from 'react';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/common/Sidebar';

const StudentAssignmentsPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Assignments</h1>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <p className="text-gray-600">No assignments found.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentAssignmentsPage; 