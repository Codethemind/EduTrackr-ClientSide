import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdArrowBack, MdAttachFile, MdDelete } from 'react-icons/md';

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`/api/assignments/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAssignment(response.data);
        
        // Fetch submission if exists
        const submissionResponse = await axios.get(`/api/assignments/${id}/submission`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSubmission(submissionResponse.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, accessToken]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);

    try {
      const response = await axios.post(`/api/assignments/${id}/submit`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmission(response.data);
      toast.success('Assignment submitted successfully');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assignment not found</h2>
        <button
          onClick={() => navigate('/student/assignments')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/student/assignments')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <MdArrowBack className="mr-2" /> Back to Assignments
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{assignment.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-600">{assignment.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="text-gray-800">{new Date(assignment.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={`font-medium ${
                submission ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {submission ? 'Submitted' : 'Not Submitted'}
              </p>
            </div>
          </div>

          {submission ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your Submission</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MdAttachFile className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{submission.fileName}</span>
                </div>
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Download
                </a>
              </div>
              {submission.comment && (
                <p className="mt-2 text-gray-600">{submission.comment}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any comments about your submission..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmission; 