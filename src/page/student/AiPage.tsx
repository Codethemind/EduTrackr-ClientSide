import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import AiStudent from '../../components/student/Ai/AiStudent';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const AiPage = () => {


  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header role="student" />
        <AiStudent/>
        
      </div>
    </div>
  );
};

export default AiPage; 