import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/student/Common/Sidebar';
import Header from '../../components/student/Common/Header';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdMenu, MdEdit, MdSave, MdCancel, MdCameraAlt, MdPerson, MdEmail, MdSchool, MdClass, MdBook } from 'react-icons/md';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user: student } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!student?.id) {
      navigate('/auth/student-login');
      return;
    }

    setEditFirstname(student.firstname || '');
    setEditLastname(student.lastname || '');
    setEditEmail(student.email || '');
    setEditProfileImage(student.profileImage || '');
    setLoading(false);
  }, [navigate, student]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setEditProfileImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      
      if (!student?.id) {
        toast.error('Student ID not found');
        return;
      }

      // Validate inputs
      if (!editFirstname.trim() || !editLastname.trim()) {
        toast.error('First name and last name are required');
        return;
      }

      if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const formData = new FormData();
      formData.append('firstname', editFirstname.trim());
      formData.append('lastname', editLastname.trim());
      formData.append('email', editEmail.trim());
      
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      if (imageFile) {
        const imageResponse = await axios.put(
          `http://localhost:3000/api/students/${student.id}/profile-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (imageResponse.data?.data?.profileImage) {
          setEditProfileImage(imageResponse.data.data.profileImage);
        }
      }

      const updateData = {
        firstname: editFirstname.trim(),
        lastname: editLastname.trim(),
        email: editEmail.trim(),
        profileImage: editProfileImage,
      };

      const response = await axios.put(
        `http://localhost:3000/api/students/${student.id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setImageFile(null);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditFirstname(student.firstname || '');
    setEditLastname(student.lastname || '');
    setEditEmail(student.email || '');
    setEditProfileImage(student.profileImage || '');
    setImageFile(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(53,130,140,0.9)] mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600">Please log in again to access your profile.</p>
          <button 
            onClick={() => navigate('/auth/student-login')}
            className="mt-4 bg-[rgba(53,130,140,0.9)] text-white px-6 py-2 rounded-lg hover:bg-[rgba(53,130,140,1)] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-white shadow-sm p-4 md:hidden border-b">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdMenu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-[rgba(53,130,140,0.8)] to-[rgba(53,130,140,1)] h-32 md:h-40 relative">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      src={editProfileImage || 'https://i.pravatar.cc/150'}
                      alt="Student Profile"
                    />
                    {isEditing && (
                      <label className="absolute bottom-2 right-2 bg-[rgba(53,130,140,0.9)] text-white p-2 rounded-full cursor-pointer hover:bg-[rgba(53,130,140,1)] transition-colors shadow-lg">
                        <MdCameraAlt size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-20 pb-6 px-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {editFirstname} {editLastname}
                </h1>
                <p className="text-gray-600 mb-4">{editEmail}</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200"
                      >
                        <MdSave size={18} />
                        <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updating}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200"
                      >
                        <MdCancel size={18} />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <MdEdit size={18} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MdPerson className="mr-2 text-[rgba(53,130,140,0.9)]" />
                  Personal Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFirstname}
                          onChange={(e) => setEditFirstname(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editFirstname}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLastname}
                          onChange={(e) => setEditLastname(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editLastname}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdEmail className="mr-1" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MdSchool className="mr-2 text-[rgba(53,130,140,0.9)]" />
                  Academic Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.departmentName || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdClass className="mr-1" />
                      Class
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.class || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdBook className="mr-1" />
                      Enrolled Courses
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {student.courses && student.courses.length > 0 ? (
                        <div className="space-y-2">
                          {student.courses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="font-medium text-gray-800">{course.name}</span>
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {course.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4">No courses assigned yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;