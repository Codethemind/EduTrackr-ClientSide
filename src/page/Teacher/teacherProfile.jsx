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
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!teacher?.id) {
      navigate('/auth/teacher-login');
      return;
    }

    setEditFirstname(teacher.firstname || '');
    setEditLastname(teacher.lastname || '');
    setEditEmail(teacher.email || '');
    setEditProfileImage(teacher.profileImage || '');
    setLoading(false);
  }, [navigate, teacher]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setEditProfileImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      if (!teacher?.id) {
        toast.error('Teacher ID not found');
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
          `http://localhost:3000/api/teachers/${teacher.id}/profile-image`,
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
        `http://localhost:3000/api/teachers/${teacher.id}`,
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

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        No Teacher Found
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
        <TeacherSideBar />
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
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10 mt-4">
  <div className="flex flex-col items-center text-center mb-8">
    <img
      className="w-40 h-40 rounded-full object-cover border-4 border-[rgba(53,130,140,0.9)] shadow"
      src={editProfileImage || 'https://i.pravatar.cc/150'}
      alt="Teacher"
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

  {/* Editable Info */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
    <div>
      <p className="text-sm text-gray-500 font-medium">First Name</p>
      {isEditing ? (
        <input
          type="text"
          value={editFirstname}
          onChange={(e) => setEditFirstname(e.target.value)}
          className="p-3 border rounded w-full"
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
          className="p-3 border rounded w-full"
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
          className="p-3 border rounded w-full"
        />
      ) : (
        <p className="text-base text-gray-800">{editEmail}</p>
      )}
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
          onClick={() => setIsEditing(false)}
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
