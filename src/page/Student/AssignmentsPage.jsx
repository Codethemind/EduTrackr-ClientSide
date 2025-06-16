// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Header from '../../components/common/Header';
// import StudentSideBar from '../../components/student/common/Sidebar';
// import AssignmentCard from '../../components/student/Assignments/AssignmentCard';
// import AssignmentFilters from '../../components/student/Assignments/AssignmentFilters';
// import AssignmentDetailModal from '../../components/student/Assignments/AssignmentDetailModal';
// import Pagination from '../../components/common/Pagination';
// import axios from '../../api/axiosInstance';
// import toast from 'react-hot-toast';

// const AssignmentsPage = () => {
//   const dispatch = useDispatch();
//   const authState = useSelector((state) => state.auth);
//   const [assignments, setAssignments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     course: 'all',
//     department: 'all',
//     status: 'all',
//     sortBy: 'dueDate'
//   });

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const studentId = authState?.user?._id || authState?.user?.id;
//   const accessToken = authState?.accessToken;

//   // Fetch assignments
//   useEffect(() => {
//     const fetchAssignments = async () => {
//       if (!studentId || !accessToken) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const response = await axios.get(`/api/assignments/student/${studentId}`, {
//           headers: { Authorization: `Bearer ${accessToken}` }
//         });

//         if (response.data.success) {
//           console.log('Fetched Assignments:', response.data.data);
//           setAssignments(response.data.data);
//         } else {
//           toast.error('Failed to load assignments');
//         }
//       } catch (error) {
//         console.error('Error fetching assignments:', error);
//         toast.error('Failed to load assignments');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAssignments();
//   }, [studentId, accessToken]);

//   // Filter and sort assignments
//   const filteredAssignments = assignments.filter(assignment => {
//     const now = new Date();
//     const dueDate = new Date(assignment.dueDate);
//     const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

//     if (filters.course !== 'all') {
//       const assignmentCourseId = typeof assignment.courseId === 'object' ? assignment.courseId?._id : assignment.courseId;
//       if (assignmentCourseId !== filters.course) {
//         return false;
//       }
//     }

//     if (filters.department !== 'all') {
//       const assignmentDepartmentId = typeof assignment.departmentId === 'object' ? assignment.departmentId?._id : assignment.departmentId;
//       if (assignmentDepartmentId !== filters.department) {
//         return false;
//       }
//     }

//     if (filters.status !== 'all') {
//       if (filters.status === 'pending' && (assignment.submissions?.length > 0 || dueDate < now)) {
//         return false;
//       }
//       if (filters.status === 'submitted' && assignment.submissions?.length === 0) {
//         return false;
//       }
//       if (filters.status === 'overdue' && (dueDate >= now || assignment.submissions?.length > 0)) {
//         return false;
//       }
//       if (filters.status === 'upcoming' && (dueDate <= now || assignment.submissions?.length > 0)) {
//         return false;
//       }
//     }

//     return true;
//   }).sort((a, b) => {
//     switch (filters.sortBy) {
//       case 'dueDate':
//         return new Date(a.dueDate) - new Date(b.dueDate);
//       case 'createdAt':
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       case 'title':
//         return a.title.localeCompare(b.title);
//       default:
//         return 0;
//     }
//   });

//   // Calculate pagination
//   const totalItems = filteredAssignments.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
//   const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [filters]);

//   // Reset to first page when items per page changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [itemsPerPage]);

//   // Ensure current page is valid
//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   // Handle assignment submission
//   const handleSubmitAssignment = async (assignment) => {
//     try {
//       const response = await axios.post(`/api/assignments/${assignment._id}/submit`, {
//         studentId,
//         assignmentId: assignment._id
//       }, {
//         headers: { Authorization: `Bearer ${accessToken}` }
//       });

//       if (response.data.success) {
//         setAssignments(prev =>
//           prev.map(a =>
//             a._id === assignment._id
//               ? { ...a, submissions: [response.data.data] }
//               : a
//           )
//         );
//         toast.success('Assignment submitted successfully!');
//       } else {
//         toast.error('Failed to submit assignment');
//       }
//     } catch (error) {
//       console.error('Error submitting assignment:', error);
//       toast.error('Failed to submit assignment');
//     }
//   };

//   // Get unique courses and departments for filters
//   const uniqueCourses = assignments.length > 0 
//     ? [...new Set(assignments.map(a => a.courseId?._id).filter(Boolean))]
//     : [];
//   const uniqueDepartments = assignments.length > 0
//     ? [...new Set(assignments.map(a => a.departmentId?._id).filter(Boolean))]
//     : [];

//   // Create maps for course and department names
//   const courseNameMap = assignments.length > 0
//     ? new Map(assignments.map(a => [a.courseId?._id, a.courseId?.name]))
//     : new Map();
//   const departmentNameMap = assignments.length > 0
//     ? new Map(assignments.map(a => [a.departmentId?._id, a.departmentId?.name]))
//     : new Map();

//   // Calculate statistics
//   const pendingAssignments = assignments.filter(a => !a.submissions?.length && new Date(a.dueDate) >= new Date()).length;
//   const submittedAssignments = assignments.filter(a => a.submissions?.length > 0).length;
//   const overdueAssignments = assignments.filter(a => !a.submissions?.length && new Date(a.dueDate) < new Date()).length;

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <StudentSideBar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header role="student" />
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
//           <div className="container mx-auto px-6 py-6">
//             <div className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
//               <p className="text-gray-600">View and submit your course assignments</p>
//             </div>

//             {/* Statistics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
//                     <p className="text-2xl font-bold text-gray-900">{pendingAssignments}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600">Submitted</p>
//                     <p className="text-2xl font-bold text-gray-900">{submittedAssignments}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-red-100 rounded-lg">
//                     <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600">Overdue</p>
//                     <p className="text-2xl font-bold text-gray-900">{overdueAssignments}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Filters */}
//             <AssignmentFilters
//               filters={filters}
//               setFilters={setFilters}
//               courses={uniqueCourses}
//               departments={uniqueDepartments}
//               courseNameMap={courseNameMap}
//               departmentNameMap={departmentNameMap}
//               isStudent={true}
//             />

//             {/* Assignments List */}
//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//                 <p className="mt-4 text-lg text-gray-600">Loading assignments...</p>
//               </div>
//             ) : filteredAssignments.length === 0 ? (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//                 <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//                   <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Found</h3>
//                 <p className="text-gray-600">
//                   {assignments.length === 0
//                     ? "You don't have any assignments yet."
//                     : "No assignments match your current filters. Try adjusting your search criteria."
//                   }
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                   {currentAssignments.map((assignment) => (
//                     <AssignmentCard
//                       key={assignment._id}
//                       assignment={assignment}
//                       onView={() => {
//                         setSelectedAssignment(assignment);
//                         setIsModalOpen(true);
//                       }}
//                       onSubmit={handleSubmitAssignment}
//                     />
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
//                   <Pagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     onPageChange={setCurrentPage}
//                     itemsPerPage={itemsPerPage}
//                     totalItems={totalItems}
//                     onItemsPerPageChange={setItemsPerPage}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Assignment Detail Modal */}
//             {isModalOpen && selectedAssignment && (
//               <AssignmentDetailModal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                   setIsModalOpen(false);
//                   setSelectedAssignment(null);
//                 }}
//                 assignment={selectedAssignment}
//                 onStartSubmission={handleSubmitAssignment}
//               />
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AssignmentsPage;