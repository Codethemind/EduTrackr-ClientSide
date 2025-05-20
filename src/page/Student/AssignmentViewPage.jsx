import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/common/Sidebar';

const AssignmentViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    // TODO: Fetch assignment data using id
    // For now, using dummy data
    setAssignment({
      title: 'Sample Assignment',
      description: 'This is a sample assignment description',
      dueDate: '2024-03-20T10:00',
      totalMarks: 100,
      status: 'pending',
    });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement assignment submission logic
    navigate('/student/assignments');
  };

  if (!assignment) {
    return (
      <div className="flex h-screen bg-gray-50">
        <StudentSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header role="student" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="container mx-auto">
              <p className="text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">{assignment.title}</h1>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{assignment.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Due Date</h3>
                      <p className="text-gray-600">{new Date(assignment.dueDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Total Marks</h3>
                      <p className="text-gray-600">{assignment.totalMarks}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="submission" className="block text-sm font-medium text-gray-700">
                        Your Submission
                      </label>
                      <textarea
                        id="submission"
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        Attach Files
                      </label>
                      <input
                        type="file"
                        id="file"
                        className="mt-1 block w-full"
                        multiple
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => navigate('/student/assignments')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssignmentViewPage; 