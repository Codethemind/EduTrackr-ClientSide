import React, { useState } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    ...user,
    // Ensure all fields are populated with at least empty strings
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'Student',
    isActive: user?.isActive !== undefined ? user.isActive : true
  });
  const [errors, setErrors] = useState({});

  // Define the fields to be displayed in the form
  const formFields = [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['Admin', 'Teacher', 'Student'], required: true },
    { name: 'isActive', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For the isActive field, convert 'Active'/'Inactive' to boolean
    if (name === 'isActive') {
      setFormData({ ...formData, [name]: value === 'Active' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ti ti-x text-lg"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="grid grid-cols-1 gap-4">
            {formFields.map((field) => (
              <div key={field.name} className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
                
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={field.name === 'isActive' ? (formData[field.name] ? 'Active' : 'Inactive') : formData[field.name] || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={`Enter ${field.label}`}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
