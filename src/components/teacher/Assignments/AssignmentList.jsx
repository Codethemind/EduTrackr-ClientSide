import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdDelete,
  MdEdit,
  MdVisibility,
} from 'react-icons/md';

const AssignmentList = () => {
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/assignments/teacher', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/api/assignments/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        toast.success('Assignment deleted successfully');
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <button
          onClick={() => navigate('/teacher/assignments/create')}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <MdAdd className="mr-2" /> Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No assignments created yet</p>
          <button
            onClick={() => navigate('/teacher/assignments/create')}
            className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
          >
            <MdAdd className="mr-2" /> Create Your First Assignment
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{assignment.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="text-gray-800">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submissions</p>
                  <p className="text-gray-800">{assignment.submissionCount || 0}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => navigate(`/teacher/assignments/${assignment._id}/view`)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                  title="View Submissions"
                >
                  <MdVisibility size={20} />
                </button>
                <button
                  onClick={() => navigate(`/teacher/assignments/${assignment._id}/edit`)}
                  className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full"
                  title="Edit Assignment"
                >
                  <MdEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(assignment._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  title="Delete Assignment"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList; 