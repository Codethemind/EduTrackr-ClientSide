 
 import React from 'react';

 const ViewUserModal = ({ user, onClose }) => {
   if (!user) return null; // safety check
 
   const renderCommonDetails = () => (
     <>
       <div>
         <p className="text-sm text-gray-500">Username</p>
         <p className="font-medium">{user.username}</p>
       </div>
 
       <div>
         <p className="text-sm text-gray-500">Email</p>
         <p className="font-medium">{user.email}</p>
       </div>
 
       <div>
         <p className="text-sm text-gray-500">Role</p>
         <p className="font-medium">{user.role}</p>
       </div>
 
       {user.firstname && (
         <div>
           <p className="text-sm text-gray-500">First Name</p>
           <p className="font-medium">{user.firstname}</p>
         </div>
       )}
 
       {user.lastname && (
         <div>
           <p className="text-sm text-gray-500">Last Name</p>
           <p className="font-medium">{user.lastname}</p>
         </div>
       )}
     </>
   );
 
   const renderStudentDetails = () => (
     <>
       <div>
         <p className="text-sm text-gray-500">Department</p>
         <p className="font-medium">{user.department}</p>
       </div>
 
       <div>
         <p className="text-sm text-gray-500">Class</p>
         <p className="font-medium">{user.class}</p>
       </div>
 
       <div>
         <p className="text-sm text-gray-500">Courses</p>
         <ul className="list-disc ml-5">
           {user.courses?.map((course, index) => (
             <li key={index}>
               {course.name} ({course.code})
             </li>
           ))}
         </ul>
       </div>
 
       <div>
         <p className="text-sm text-gray-500">Blocked Status</p>
         <p className="font-medium">{user.isBlock ? 'Blocked' : 'Active'}</p>
       </div>
     </>
   );
 
   const renderTeacherDetails = () => (
     <div>
       <p className="text-sm text-gray-500">Department</p>
       <p className="font-medium">{user.department}</p>
     </div>
   );
 
   return (
     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
       <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
         <div className="mb-4 flex justify-between items-center">
           <h3 className="text-lg font-medium">User Details</h3>
           <button
             onClick={onClose}
             className="text-gray-500 hover:text-gray-700"
           >
             <i className="ti ti-x text-xl"></i>
           </button>
         </div>
 
         <div className="space-y-4">
           {renderCommonDetails()}
 
           {user.role === 'Student' && renderStudentDetails()}
           {user.role === 'Teacher' && renderTeacherDetails()}
           {/* For Admin, no extra fields needed beyond common ones */}
         </div>
 
         <div className="mt-6 text-right">
           <button
             onClick={onClose}
             className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
           >
             Close
           </button>
         </div>
       </div>
     </div>
   );
 };
 
 export default ViewUserModal;
 