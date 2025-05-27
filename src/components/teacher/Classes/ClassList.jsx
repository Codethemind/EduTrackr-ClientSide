// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import axios from '../../../api/axiosInstance';
// import { toast } from 'react-hot-toast';
// import { MdAdd, MdPeople, MdSchedule, MdLocationOn } from 'react-icons/md';

// const ClassList = () => {
//   const navigate = useNavigate();
//   const { accessToken } = useSelector((state) => state.auth);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   const fetchClasses = async () => {
//     try {
//       const response = await axios.get('/api/classes/teacher', {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setClasses(response.data);
//     } catch (error) {
//       console.error('Error fetching classes:', error);
//       toast.error('Failed to load classes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
//         <button
//           onClick={() => navigate('/teacher/my-classes/create')}
//           className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           <MdAdd className="mr-2" /> Create Class
//         </button>
//       </div>

//       {classes.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">No classes created yet</p>
//           <button
//             onClick={() => navigate('/teacher/my-classes/create')}
//             className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
//           >
//             <MdAdd className="mr-2" /> Create Your First Class
//           </button>
//         </div>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {classes.map((classItem) => (
//             <div key={classItem._id} className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">{classItem.name}</h2>
//               <p className="text-gray-600 mb-4">{classItem.description}</p>
              
//               <div className="space-y-3 mb-4">
//                 <div className="flex items-center text-gray-600">
//                   <MdPeople className="mr-2" />
//                   <span>{classItem.studentCount || 0} Students</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <MdSchedule className="mr-2" />
//                   <span>{classItem.schedule}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <MdLocationOn className="mr-2" />
//                   <span>{classItem.location || 'Online'}</span>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <button
//                   onClick={() => navigate(`/teacher/my-classes/${classItem._id}/students`)}
//                   className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg"
//                 >
//                   View Students
//                 </button>
//                 <button
//                   onClick={() => navigate(`/teacher/my-classes/${classItem._id}/edit`)}
//                   className="px-4 py-2 text-yellow-500 hover:bg-yellow-50 rounded-lg"
//                 >
//                   Edit Class
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClassList; 