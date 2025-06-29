import React, { useState, useEffect } from 'react';

const DepartmentModal = ({ department, onClose, onSave, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        name: department.name,
        code: department.code,
        headOfDepartment: department.headOfDepartment,
      });
    }
  }, [department, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    }
    if (!formData.headOfDepartment.trim()) {
      newErrors.headOfDepartment = 'Head of Department is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'edit' ? 'Edit Department' : 'Add New Department'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Department Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter department name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
              Department Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter department code"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headOfDepartment">
              Head of Department
            </label>
            <input
              type="text"
              id="headOfDepartment"
              name="headOfDepartment"
              value={formData.headOfDepartment}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.headOfDepartment ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter head of department"
            />
            {errors.headOfDepartment && (
              <p className="text-red-500 text-xs mt-1">{errors.headOfDepartment}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal; 