import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance.jsx';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import StudentList from '../../components/teacher/Students/StudentList.jsx';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState('');

  useEffect(() => {
    const fetchTeacherAndStudents = async () => {
      try {
        // 1. Get teacher details
        const teacher = JSON.parse(localStorage.getItem('user'));
        
        const department = teacher?.departmentName;

        if (!department) {
          console.error("Teacher department not found");
          return;
        }

        setTeacherDepartment(department);

        // 2. Get student list
        const res = await axios.get('/api/students/');
        
        // Extract the actual array of students from the response
        const allStudents = res.data.data || [];
        console.log("Students data:", allStudents);

        // 3. Filter students by department
        const filteredByDept = allStudents.filter(
          student => student.departmentName?.toLowerCase() === department.toLowerCase()
        );

        setStudents(filteredByDept);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAndStudents();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <StudentList
            students={students}
            loading={loading}
            teacherDepartment={teacherDepartment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;