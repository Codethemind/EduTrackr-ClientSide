// components/admin/schedule/DepartmentSelector.jsx
import React, { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const DepartmentSelector = ({ selectedDepartment, onDepartmentChange }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments and courses, then calculate course count
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments and courses simultaneously
        const [deptResponse, courseResponse] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/courses')
        ]);
        
        console.log('Departments response:', deptResponse.data);
        console.log('Courses response:', courseResponse.data);
        
        if (deptResponse.data.success && courseResponse.data.success) {
          const departmentsData = deptResponse.data.data;
          const coursesData = courseResponse.data.data;
          
          // Calculate course count for each department
          const departmentsWithCount = departmentsData.map(dept => {
            const courseCount = coursesData.filter(course => 
              course.departmentId === dept._id || course.departmentId?._id === dept._id
            ).length;
            
            return {
              ...dept,
              courseCount: courseCount
            };
          });
          
          setDepartments(departmentsWithCount);
        } else {
          toast.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load departments and courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Building size={20} className="text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold">Select Department</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Building size={20} className="text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold">Select Department</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {departments.map(dept => (
          <button
            key={dept._id}
            onClick={() => onDepartmentChange(dept.name)}
            className={`p-3 rounded-md border text-center transition-colors ${
              selectedDepartment === dept.name
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{dept.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {dept.courseCount || 0} Courses
            </div>
          </button>
        ))}
        <button
          onClick={() => onDepartmentChange('')}
          className={`p-3 rounded-md border text-center transition-colors ${
            !selectedDepartment
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="font-medium">All Departments</div>
          <div className="text-sm text-gray-500 mt-1">View All Schedules</div>
        </button>
      </div>
    </div>
  );
};

export default DepartmentSelector;