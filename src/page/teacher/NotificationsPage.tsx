import React from 'react';
import NotificationPage from '../../components/common/NotificationPage';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const NotificationsPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <NotificationPage />
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;