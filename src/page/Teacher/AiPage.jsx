import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import AiTeacher from '../../components/teacher/Ai/AiTeacher';

import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const AiPage = () => {




  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
      <AiTeacher/>
      </div>
    </div>
  );
};

export default AiPage;