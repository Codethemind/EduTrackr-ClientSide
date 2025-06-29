import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

interface Department {
  name: string;
  code: string;
  establishedDate: string;
  headOfDepartment: string;
  departmentEmail: string;
  departmentPhone: string;
  active: boolean;
}

interface Errors {
  name?: string;
  code?: string;
  establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
}

interface AddDepartmentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ onClose, onSave }) => {
  const [department, setDepartment] = useState<Department>({
    name: '',
    code: '',
    establishedDate: '',
    headOfDepartment: '',
    departmentEmail: '',
    departmentPhone: '',
    active: true,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const validationErrors: Errors = {};
    setServerError('');

    if (!department.name.trim()) validationErrors.name = 'Department name is required';
    if (!department.code.trim()) validationErrors.code = 'Department code is required';
    if (!department.establishedDate) validationErrors.establishedDate = 'Established date is required';
    if (!department.headOfDepartment.trim()) validationErrors.headOfDepartment = 'Head of department is required';

    if (!department.departmentEmail.trim()) {
      validationErrors.departmentEmail = 'Department email is required';
    } else if (!/\S+@\S+\.\S+/.test(department.departmentEmail)) {
      validationErrors.departmentEmail = 'Invalid email format';
    }

    if (!department.departmentPhone.trim()) {
      validationErrors.departmentPhone = 'Department phone is required';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:3000/api/departments/create', department);
      setUploading(false);

      if (response.data?.success) {
        toast.success('Department added successfully!');
        onSave(response.data.data);
        onClose();
      } else {
        const message = response.data?.message || 'Failed to add department';
        setServerError(message);
        toast.error(message);
      }
    } catch (error: any) {
      setUploading(false);
      console.error('Error adding department:', error);

      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || 'An error occurred';

      if (status === 409 || errorMessage.includes('already exists')) {
        if (errorMessage.includes('name')) {
          setErrors(prev => ({ ...prev, name: 'This department name already exists' }));
          toast.error('This department name already exists');
        } else if (errorMessage.includes('code')) {
          setErrors(prev => ({ ...prev, code: 'This department code already exists' }));
          toast.error('This department code already exists');
        } else {
          setServerError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (error.request) {
        setServerError('Network error. Please check your connection.');
        toast.error('Network error. Please check your connection.');
      } else {
        setServerError(error.message || 'An unexpected error occurred');
        toast.error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name as keyof Errors]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof Errors];
        return updated;
      });
    }

    if (serverError) {
      setServerError('');
    }

    setDepartment(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New Department</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">✖</button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Department Name*', name: 'name', type: 'text' },
              { label: 'Department Code*', name: 'code', type: 'text' },
              { label: 'Established Date*', name: 'establishedDate', type: 'date' },
              { label: 'Head of Department*', name: 'headOfDepartment', type: 'text' },
              { label: 'Department Email*', name: 'departmentEmail', type: 'email' },
              { label: 'Department Phone*', name: 'departmentPhone', type: 'tel' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block mb-1 text-sm font-medium">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={department[name as keyof Department]}
                  onChange={handleChange}
                  className={`border rounded-md w-full p-2 ${errors[name as keyof Errors] ? 'border-red-500' : ''}`}
                  required
                />
                {errors[name as keyof Errors] && (
                  <p className="text-xs text-red-500">{errors[name as keyof Errors]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition ${
                  uploading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Saving...' : 'Save Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDepartmentModal;
