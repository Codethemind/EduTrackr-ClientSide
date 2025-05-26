import React, { useState, useEffect } from 'react';

const CreateAssignmentModal = ({ isOpen, onClose, onSubmit, teacherSchedules }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    dueTime: '23:59',
    maxMarks: 100,
    courseId: '',
    departmentId: '',
    attachments: [],
    allowLateSubmission: false,
    lateSubmissionPenalty: 10,
    submissionFormat: 'document', // document, link, text
    isGroupAssignment: false,
    maxGroupSize: 1
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        dueTime: '23:59',
        maxMarks: 100,
        courseId: '',
        departmentId: '',
        attachments: [],
        allowLateSubmission: false,
        lateSubmissionPenalty: 10,
        submissionFormat: 'document',
        isGroupAssignment: false,
        maxGroupSize: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  // Get unique courses and departments from teacher schedules
  const getUniqueOptions = () => {
    const courses = [];
    const departments = [];
    const courseMap = new Map();
    const departmentMap = new Map();

    teacherSchedules?.forEach(schedule => {
      if (schedule.courseId && !courseMap.has(schedule.courseId._id)) {
        courseMap.set(schedule.courseId._id, schedule.courseId);
        courses.push(schedule.courseId);
      }
      if (schedule.departmentId && !departmentMap.has(schedule.departmentId._id)) {
        departmentMap.set(schedule.departmentId._id, schedule.departmentId);
        departments.push(schedule.departmentId);
      }
    });

    return { courses, departments };
  };

  const { courses, departments } = getUniqueOptions();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData(prev => ({ ...prev, courseId }));

    // Auto-select department if there's only one department for this course
    const courseDepartments = teacherSchedules
      ?.filter(s => s.courseId?._id === courseId)
      ?.map(s => s.departmentId)
      ?.filter((dept, index, arr) => dept && arr.findIndex(d => d._id === dept._id) === index);

    if (courseDepartments?.length === 1) {
      setFormData(prev => ({ ...prev, departmentId: courseDepartments[0]._id }));
    }
  };

  // Handle file attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, attachments: files }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.courseId) newErrors.courseId = 'Course selection is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department selection is required';
    if (formData.maxMarks < 1) newErrors.maxMarks = 'Maximum marks must be at least 1';

    // Check if due date is in the future
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    if (dueDateTime <= new Date()) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    if (formData.isGroupAssignment && formData.maxGroupSize < 2) {
      newErrors.maxGroupSize = 'Group size must be at least 2 for group assignments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Combine date and time
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      
      const assignmentData = {
        ...formData,
        dueDate: dueDateTime.toISOString(),
        maxGroupSize: formData.isGroupAssignment ? formData.maxGroupSize : 1
      };

      await onSubmit(assignmentData);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Assignment</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter assignment title"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course *
                    </label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleCourseChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.courseId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                    {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.departmentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>}
                  </div>

                  {/* Due Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.dueDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Time
                      </label>
                      <input
                        type="time"
                        name="dueTime"
                        value={formData.dueTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Max Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Marks *
                    </label>
                    <input
                      type="number"
                      name="maxMarks"
                      value={formData.maxMarks}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maxMarks ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.maxMarks && <p className="text-red-500 text-xs mt-1">{errors.maxMarks}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Brief description of the assignment"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed instructions for students"
                    />
                  </div>

                  {/* Submission Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission Format
                    </label>
                    <select
                      name="submissionFormat"
                      value={formData.submissionFormat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="document">Document Upload</option>
                      <option value="link">Link/URL</option>
                      <option value="text">Text Submission</option>
                    </select>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG
                    </p>
                  </div>

                  {/* Group Assignment Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isGroupAssignment"
                        checked={formData.isGroupAssignment}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Group Assignment
                      </label>
                    </div>

                    {formData.isGroupAssignment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Group Size
                        </label>
                        <input
                          type="number"
                          name="maxGroupSize"
                          value={formData.maxGroupSize}
                          onChange={handleInputChange}
                          min="2"
                          max="10"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.maxGroupSize ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.maxGroupSize && <p className="text-red-500 text-xs mt-1">{errors.maxGroupSize}</p>}
                      </div>
                    )}
                  </div>

                  {/* Late Submission Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowLateSubmission"
                        checked={formData.allowLateSubmission}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Allow Late Submissions
                      </label>
                    </div>

                    {formData.allowLateSubmission && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Late Submission Penalty (%)
                        </label>
                        <input
                          type="number"
                          name="lateSubmissionPenalty"
                          value={formData.lateSubmissionPenalty}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>{isSubmitting ? 'Creating...' : 'Create Assignment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;