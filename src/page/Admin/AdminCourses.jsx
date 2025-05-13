import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance.jsx';
import Sidebar from '../../components/admin/Commen/Sidebar.jsx';
import Header from '../../components/admin/Commen/Header.jsx';
import CourseTable from '../../components/admin/courses/CourseTable.jsx';
import AddCourseModal from '../../components/admin/courses/AddCourseModal.jsx';
import EditCourseModal from '../../components/admin/courses/EditCourseModal.jsx';
import ViewCourseModal from '../../components/admin/courses/ViewCourseModal.jsx';
import DeleteCourseModal from '../../components/admin/courses/DeleteCourseModal.jsx';
import Pagination from '../../components/admin/users/Pagination.jsx';
import { toast } from 'react-hot-toast';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coursesPerPage, setCoursesPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      setCourses(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to fetch departments');
    }
  };

  const handleAdd = () => {
    setSelectedCourse(null);
    setModalType('add');
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setModalType('edit');
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setModalType('view');
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setModalType(null);
  };

  const handleSaveCourse = async (courseData) => {
    try {
      let response;
      
      if (courseData._id) {
        // Update existing course
        response = await axios.put(`/api/courses/${courseData._id}`, courseData);
        if (response.data && response.data.success) {
          setCourses(prevCourses => 
            prevCourses.map(course => 
              course._id === courseData._id ? response.data.data : course
            )
          );
          toast.success('Course updated successfully!');
        }
      } else {
        // Create new course
        response = await axios.post('/api/courses/create', courseData);
        if (response.data && response.data.success) {
          setCourses(prevCourses => [...prevCourses, response.data.data]);
          toast.success('Course added successfully!');
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error('Error saving course:', err);
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    try {
      const response = await axios.delete(`/api/courses/${selectedCourse._id}`);
      
      if (response.data && response.data.success) {
        setCourses(prevCourses => 
          prevCourses.filter(course => course._id !== selectedCourse._id)
        );
        toast.success('Course deleted successfully!');
        handleCloseModal();
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar activePage="courses" onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Course Management</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage academic courses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                  Rows:
                </label>
                <select
                  id="rowsPerPage"
                  value={coursesPerPage}
                  onChange={(e) => {
                    setCoursesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                + Add Course
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <CourseTable
                courses={currentCourses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
              
              {filteredCourses.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}

          {modalType === 'add' && (
            <AddCourseModal
              departments={departments}
              onClose={handleCloseModal}
              onSave={handleSaveCourse}
            />
          )}
          {modalType === 'edit' && selectedCourse && (
            <EditCourseModal
              course={selectedCourse}
              departments={departments}
              onClose={handleCloseModal}
              onSave={handleSaveCourse}
            />
          )}
          {modalType === 'view' && selectedCourse && (
            <ViewCourseModal
              course={selectedCourse}
              onClose={handleCloseModal}
            />
          )}
          {modalType === 'delete' && selectedCourse && (
            <DeleteCourseModal
              course={selectedCourse}
              onClose={handleCloseModal}
              onDeleteSuccess={handleConfirmDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCourses; 