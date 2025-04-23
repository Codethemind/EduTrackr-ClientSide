import React, { useEffect, useState } from 'react';
import axios from "../../api/axiosInstance.jsx";
import Sidebar from '../../components/student/Common/Sidebar';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Profile = () => {
  const navigate = useNavigate();
  const { user: student } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);

  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log('sadas',student)
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

  const handleUpdate = async () => {
    try {
      const id = student.id;

      const updateData = {
        firstname: editFirstname,
        lastname: editLastname,
        email: editEmail,
        profileImage: editProfileImage,
      };

      await axios.put(`/api/students/${id}`, updateData);

      toast.success('Profile updated successfully! 🎉', {
        duration: 3000,
      });

      setIsEditing(false);

    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Update failed ❌', {
        duration: 3000,
      });
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-[rgba(53,130,140,0.4)]">
      <Sidebar page="Profile" />

      <div className="flex-1 p-6 mt-5 md:ml-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">

          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              className="w-32 h-32 rounded-full object-cover border-4 border-[rgba(53,130,140,0.9)] shadow"
              src={editProfileImage || 'https://i.pravatar.cc/150'}
              alt="Student"
            />
            {isEditing && (
              <input
                type="text"
                placeholder="Profile Image URL"
                value={editProfileImage}
                onChange={(e) => setEditProfileImage(e.target.value)}
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

            {/* Non-editable Info */}
            <div>
              <p className="text-sm text-gray-500 font-medium">Department</p>
              <p className="text-base text-gray-800">{student.department}</p>
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

      {/* Hot Toast Notification Container */}
      <Toaster />
    </div>
  );
};

export default Profile;
