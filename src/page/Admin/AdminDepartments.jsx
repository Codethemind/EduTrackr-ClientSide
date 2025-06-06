import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance.jsx';
import Sidebar from '../../components/admin/Commen/Sidebar.jsx';
import Header from '../../components/admin/Commen/Header.jsx';
import DepartmentTable from '../../components/admin/departments/DepartmentTable.jsx';
import AddDepartmentModal from '../../components/admin/departments/AddDepartmentModal.jsx';
import EditDepartmentModal from '../../components/admin/departments/EditDepartmentModal.jsx';
import ViewDepartmentModal from '../../components/admin/departments/ViewDepartmentModal.jsx';
import DeleteDepartmentModal from '../../components/admin/departments/DeleteDepartmentModal.jsx';
import Pagination from '../../components/admin/users/Pagination.jsx';
import { toast } from 'react-hot-toast';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentsPerPage, setDepartmentsPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/departments');
      setDepartments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setModalType('add');
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setModalType('edit');
  };

  const handleView = (department) => {
    setSelectedDepartment(department);
    setModalType('view');
  };

  const handleDelete = (department) => {
    setSelectedDepartment(department);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setSelectedDepartment(null);
    setModalType(null);
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      let response;
      
      if (departmentData._id) {
        // Update existing department
        response = await axios.put(`/api/departments/${departmentData._id}`, departmentData);
        if (response.data && response.data.success) {
          setDepartments(prevDepartments => 
            prevDepartments.map(dept => 
              dept._id === departmentData._id ? response.data.data : dept
            )
          );
          toast.success('Department updated successfully!');
        }
      } else {
        // Create new department
        response = await axios.post('/api/departments/create', departmentData);
        if (response.data && response.data.success) {
          setDepartments(prevDepartments => [...prevDepartments, response.data.data]);
          toast.success('Department added successfully!');
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error('Error saving department:', err);
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;
    try {
      const response = await axios.delete(`/api/departments/${selectedDepartment._id}`);
      
      if (response.data && response.data.success) {
        setDepartments(prevDepartments => 
          prevDepartments.filter(dept => dept._id !== selectedDepartment._id)
        );
        toast.success('Department deleted successfully!');
        handleCloseModal();
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDepartment = currentPage * departmentsPerPage;
  const indexOfFirstDepartment = indexOfLastDepartment - departmentsPerPage;
  const currentDepartments = filteredDepartments.slice(indexOfFirstDepartment, indexOfLastDepartment);
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar activePage="departments" onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Department Management</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage academic departments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                  Rows:
                </label>
                <select
                  id="rowsPerPage"
                  value={departmentsPerPage}
                  onChange={(e) => {
                    setDepartmentsPerPage(Number(e.target.value));
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
                + Add Department
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search departments..."
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
              <DepartmentTable
                departments={currentDepartments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
              
              {filteredDepartments.length > 0 && (
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
            <AddDepartmentModal
              onClose={handleCloseModal}
              onSave={handleSaveDepartment}
            />
          )}
          {modalType === 'edit' && selectedDepartment && (
            <EditDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
              onSave={handleSaveDepartment}
            />
          )}
          {modalType === 'view' && selectedDepartment && (
            <ViewDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
            />
          )}
          {modalType === 'delete' && selectedDepartment && (
            <DeleteDepartmentModal
              department={selectedDepartment}
              onClose={handleCloseModal}
              onDeleteSuccess={handleConfirmDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDepartments; 