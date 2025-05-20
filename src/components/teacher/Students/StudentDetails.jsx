import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdArrowBack, MdEmail, MdPhone, MdClass, MdAssignment, MdGrade } from 'react-icons/md';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student details');
      navigate('/teacher/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Student not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/teacher/students')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <MdArrowBack className="mr-2" /> Back to Students
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <img
                className="h-20 w-20 rounded-full"
                src={student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0D8ABC&color=fff`}
                alt={student.name}
              />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">Student ID: {student.studentId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MdEmail className="mr-2" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MdPhone className="mr-2" />
                  <span>{student.phone || 'No phone number'}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MdClass className="mr-2" />
                  <span>{student.classes?.length || 0} Classes Enrolled</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MdAssignment className="mr-2" />
                  <span>{student.assignments?.length || 0} Assignments</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MdGrade className="mr-2" />
                  <span>Average Grade: {student.averageGrade || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {student.classes && student.classes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.classes.map((classItem) => (
                  <div key={classItem._id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">{classItem.schedule}</p>
                    <p className="text-sm text-gray-600">{classItem.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 