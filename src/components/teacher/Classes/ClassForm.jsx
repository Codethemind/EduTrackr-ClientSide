// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import axios from '../../../api/axiosInstance';
// import { toast } from 'react-hot-toast';

// const ClassForm = ({ mode = 'create' }) => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const { accessToken } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     schedule: '',
//     location: '',
//     capacity: '',
//   });

//   useEffect(() => {
//     if (mode === 'edit' && id) {
//       fetchClassDetails();
//     }
//   }, [mode, id]);

//   const fetchClassDetails = async () => {
//     try {
//       const response = await axios.get(`/api/classes/${id}`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setFormData(response.data);
//     } catch (error) {
//       console.error('Error fetching class details:', error);
//       toast.error('Failed to load class details');
//       navigate('/teacher/my-classes');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (mode === 'create') {
//         await axios.post('/api/classes', formData, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         toast.success('Class created successfully');
//       } else {
//         await axios.put(`/api/classes/${id}`, formData, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         toast.success('Class updated successfully');
//       }
//       navigate('/teacher/my-classes');
//     } catch (error) {
//       console.error('Error saving class:', error);
//       toast.error(mode === 'create' ? 'Failed to create class' : 'Failed to update class');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           {mode === 'create' ? 'Create New Class' : 'Edit Class'}
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//               Class Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               rows="3"
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
//               Schedule
//             </label>
//             <input
//               type="text"
//               id="schedule"
//               name="schedule"
//               value={formData.schedule}
//               onChange={handleChange}
//               placeholder="e.g., Monday, Wednesday 10:00 AM - 11:30 AM"
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="location" className="block text-sm font-medium text-gray-700">
//               Location
//             </label>
//             <input
//               type="text"
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               placeholder="e.g., Room 101 or Online"
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
//               Capacity
//             </label>
//             <input
//               type="number"
//               id="capacity"
//               name="capacity"
//               value={formData.capacity}
//               onChange={handleChange}
//               min="1"
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/teacher/my-classes')}
//               className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//             >
//               {loading ? 'Saving...' : mode === 'create' ? 'Create Class' : 'Update Class'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ClassForm; 