import React from 'react';
import TeacherSideBar from '../../components/sideBar/teacherSideBar';
// import teacherImage from 'https://randomuser.me/api/portraits/men/75.jpg'

const TeacherInfo = () => {
  // Sample static data – replace with dynamic data as needed
  const teacherData = {
    name: 'Mr. Abdul Hameed',
    phone: '+91 98765 43210',
    address: '123 Knowledge Street, Edutown, Kerala',
    classTeacherOf: '10th Grade - A Section',
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-[rgba(53,130,140,0.4)]">
      <TeacherSideBar page="Profile" />

      <div className="flex-1 p-4 md:ml-12 transition-all duration-300 mt-5 flex justify-center items-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <img
              src={"https://randomuser.me/api/portraits/women/45.jpg"}
              alt="Teacher Profile"
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-lg border-4 border-[rgba(53,130,140,0.8)]"
            />

            {/* Info Section */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{teacherData.name}</h2>
              
              <div className="mt-4 space-y-4 text-gray-700">
                <div>
                  <span className="font-semibold">Phone Number:</span>
                  <p>{teacherData.phone}</p>
                </div>

                <div>
                  <span className="font-semibold">Address:</span>
                  <p>{teacherData.address}</p>
                </div>

                <div>
                  <span className="font-semibold">Class Teacher of:</span>
                  <p>{teacherData.classTeacherOf}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherInfo;
