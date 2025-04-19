import React from 'react';
import StudentSideBar from '../../components/sideBar/studentSideBar';

const Profile = () => {
  // Dummy student data – Replace with real backend data
  const student = {
    name: "Aliya Rahman",
    class: "Grade 10 - A",
    role: "Student",
    email: "aliya.rahman@example.com",
    admissionNo: "SHS10234",
    guardian: "Mr. Rahman",
    address: "Kozhikode, Kerala, India",
    profilePhoto: "https://i.pravatar.cc/150?img=32",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-[rgba(53,130,140,0.4)]">
      <StudentSideBar page="Profile" />

      <div className="flex-1 p-6 mt-5 md:ml-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              className="w-32 h-32 rounded-full object-cover border-4 border-[rgba(53,130,140,0.9)] shadow"
              src={student.profilePhoto}
              alt="Student"
            />
            <h2 className="mt-4 text-3xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{student.role}</p>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Admission Number</p>
              <p className="text-base text-gray-800">{student.admissionNo}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Class</p>
              <p className="text-base text-gray-800">{student.class}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
              <p className="text-base text-gray-800">{student.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Guardian</p>
              <p className="text-base text-gray-800">{student.guardian}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 font-medium">Address</p>
              <p className="text-base text-gray-800">{student.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
