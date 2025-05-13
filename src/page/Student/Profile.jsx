import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/student/Common/Sidebar';
import Header from '../../components/student/Common/Header';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdMenu } from 'react-icons/md';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user: student } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
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
      setImageFile(file);
      setEditProfileImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      if (!student?.id) {
        toast.error('Student ID not found');
        return;
      }

      const formData = new FormData();
      formData.append('firstname', editFirstname);
      formData.append('lastname', editLastname);
      formData.append('email', editEmail);
      
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
        firstname: editFirstname,
        lastname: editLastname,
        email: editEmail,
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
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        No Student Found
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (hidden by default on small screens) */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Header with Hamburger Icon */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} />
          </button>
          <Header />
        </div>

        {/* Header for desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Profile content */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-4">
          <div className="flex flex-col items-center text-center mb-8">
            <img
              className="w-32 h-32 rounded-full object-cover border-4 border-[rgba(53,130,140,0.9)] shadow"
              src={editProfileImage || 'https://i.pravatar.cc/150'}
              alt="Student"
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 p-2 border rounded w-64 text-center text-sm"
              />
            )}
          </div>

          {/* Editable Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">First Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editFirstname}
                  onChange={(e) => setEditFirstname(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              ) : (
                <p className="text-base text-gray-800">{editFirstname}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Last Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editLastname}
                  onChange={(e) => setEditLastname(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              ) : (
                <p className="text-base text-gray-800">{editLastname}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
              {isEditing ? (
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              ) : (
                <p className="text-base text-gray-800">{editEmail}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Department</p>
              <p className="text-base text-gray-800">{student.departmentName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Class</p>
              <p className="text-base text-gray-800">{student.class}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 font-medium">Courses</p>
              <ul className="list-disc ml-5 text-gray-800">
                {student.courses && student.courses.length > 0 ? (
                  student.courses.map((course) => (
                    <li key={course.id}>
                      {course.name} ({course.code})
                    </li>
                  ))
                ) : (
                  <li>No courses assigned</li>
                )}
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-6 py-2 rounded-full shadow-lg"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full shadow-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-6 py-2 rounded-full shadow-lg"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
