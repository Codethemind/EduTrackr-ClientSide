import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import Header from '../../components/teacher/common/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdMenu } from 'react-icons/md';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { user: teacher } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editData, setEditData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    profileImage: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!teacher?.id) {
      navigate('/auth/teacher-login');
      return;
    }
    setEditData({
      username: teacher.username || '',
      firstname: teacher.firstname || '',
      lastname: teacher.lastname || '',
      email: teacher.email || '',
      profileImage: teacher.profileImage || '',
    });
    setLoading(false);
  }, [navigate, teacher]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setEditData(prev => ({
        ...prev,
        profileImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      if (!teacher?.id) {
        toast.error('Teacher ID not found');
        return;
      }

      let profileImageUrl = editData.profileImage;

      // If a new image is selected, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const imageRes = await axios.put(
          `http://localhost:3000/api/teachers/${teacher.id}/profile-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        profileImageUrl = imageRes.data?.data?.profileImage || profileImageUrl;
      }

      // Update the rest of the profile
      const updateData = {
        username: editData.username,
        firstname: editData.firstname,
        lastname: editData.lastname,
        email: editData.email,
        profileImage: profileImageUrl,
      };

      await axios.put(
        `http://localhost:3000/api/teachers/${teacher.id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher?.firstname || '')}+${encodeURIComponent(teacher?.lastname || '')}&background=35828C&color=fff&size=256`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        Loading...
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        No Teacher Found
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay for sidebar on mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <TeacherSideBar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} />
          </button>
          <Header />
        </div>
        <div className="hidden md:block">
          <Header />
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10 mt-4">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-2">
              {teacher.role}
            </div>
            <img
              className="w-40 h-40 rounded-full object-cover border-4 border-[rgba(53,130,140,0.9)] shadow"
              src={editData.profileImage || fallbackAvatar}
              alt="Teacher"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackAvatar;
              }}
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 p-2 border rounded w-72 text-center text-sm"
              />
            )}
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {['username', 'email', 'firstname', 'lastname'].map((field) => (
              <div key={field}>
                <p className="text-sm text-gray-500 font-medium capitalize">{field}</p>
                {isEditing ? (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={editData[field]}
                    onChange={(e) => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
                    className="p-3 border rounded w-full"
                  />
                ) : (
                  <p className="text-base text-gray-800">{editData[field]}</p>
                )}
              </div>
            ))}

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 font-medium">Department</p>
              <p className="text-base text-gray-800">
                {teacher.departmentName || 'Not assigned'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Department cannot be edited from profile)
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center mt-10 space-x-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-8 py-3 rounded-full shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditData({
                      username: teacher.username || '',
                      firstname: teacher.firstname || '',
                      lastname: teacher.lastname || '',
                      email: teacher.email || '',
                      profileImage: teacher.profileImage || '',
                    });
                    setImageFile(null);
                    setIsEditing(false);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-full shadow-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-8 py-3 rounded-full shadow-lg"
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

export default TeacherProfile;
