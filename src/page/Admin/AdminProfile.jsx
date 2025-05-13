import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/admin/Commen/Sidebar';
import Header from '../../components/admin/Commen/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user: admin } = useSelector(state => state.auth);
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
    if (!admin?.id) {
      navigate('/auth/admin-login');
      return;
    }
    setEditData({
      username: admin.username || '',
      firstname: admin.firstname || '',
      lastname: admin.lastname || '',
      email: admin.email || '',
      profileImage: admin.profileImage || '',
    });
    setLoading(false);
  }, [navigate, admin]);

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
      if (!admin?.id) {
        toast.error('Admin ID not found');
        return;
      }

      let profileImageUrl = editData.profileImage;

      // If a new image is selected, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const imageRes = await axios.put(
          `http://localhost:3000/api/admins/${admin.id}/profile-image`,
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
        `http://localhost:3000/api/admins/${admin.id}`,
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

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin?.firstname || '')}+${encodeURIComponent(admin?.lastname || '')}&background=3B82F6&color=fff&size=256`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        Loading...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">
        No Admin Found
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      {/* Sidebar for mobile (with overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePage="profile" />
      </div>
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <Sidebar activePage="profile" onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-0 lg:pl-64">
        {/* Header with Hamburger Menu */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            View and manage your account information
          </p>

          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-2">
                {admin.role}
              </div>
              <img
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-blue-100 shadow"
                src={editData.profileImage || fallbackAvatar}
                alt="Admin"
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
                  <p className="text-sm text-gray-500 font-medium capitalize">
                    {field === 'firstname' ? 'First Name' : 
                     field === 'lastname' ? 'Last Name' : 
                     field === 'email' ? 'Email Address' : field}
                  </p>
                  {isEditing ? (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={editData[field]}
                      onChange={(e) => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-base text-gray-800">{editData[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-center mt-10 space-x-6">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditData({
                        username: admin.username || '',
                        firstname: admin.firstname || '',
                        lastname: admin.lastname || '',
                        email: admin.email || '',
                        profileImage: admin.profileImage || '',
                      });
                      setImageFile(null);
                      setIsEditing(false);
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile; 