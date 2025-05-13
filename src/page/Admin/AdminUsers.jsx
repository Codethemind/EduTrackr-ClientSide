import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance.jsx';
import Sidebar from '../../components/admin/Commen/Sidebar.jsx';
import Header from '../../components/admin/Commen/Header.jsx';
import UserTable from '../../components/admin/users/UsersTable.jsx';
import Filter from '../../components/admin/users/FilterSection.jsx';
import Pagination from '../../components/admin/users/Pagination.jsx';
import EditUserModal from '../../components/admin/users/EditUserModal.jsx';
import ViewUserModal from '../../components/admin/users/ViewUserModal.jsx';
import DeleteUserModal from '../../components/admin/users/DeleteUserModal.jsx';
import AddUserModal from '../../components/admin/users/AddUserModal.jsx';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar

  const roleOptions = ['All', 'Admin', 'Teacher', 'Student'];

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const [adminRes, teacherRes, studentRes] = await Promise.all([
        axios.get('/api/admins/'),
        axios.get('/api/teachers/'),
        axios.get('/api/students/'),
      ]);

      const admins = adminRes.data.data || [];
      const teachers = teacherRes.data.data || [];
      const students = studentRes.data.data || [];

      setUsers([...admins, ...teachers, ...students]);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const getEndpointByRole = (role) => {
    switch (role) {
      case 'Admin':
        return '/api/admins';
      case 'Teacher':
        return '/api/teachers';
      case 'Student':
        return '/api/students';
      default:
        return '/api/students';
    }
  };

  const handleAdd = () => {
    setSelectedUser({
      username: '',
      email: '',
      role: 'Student',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true,
    });
    setModalType('add');
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setModalType('edit');
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setModalType('view');
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleConfirmDelete = async (id) => {
    if (!selectedUser) return;
    try {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== selectedUser.id));
      handleCloseModal();
      
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const endpoint = getEndpointByRole(userData.role);
      setUsers((prevUsers) => {
        const isExistingUser = prevUsers.some((u) => u.id === userData.id);
        if (isExistingUser) {
          return prevUsers.map((u) =>
            u.id === userData.id ? userData : u
          );
        } else {
          return [...prevUsers, userData];
        }
      });
      
      handleCloseModal();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'All' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <>
      {/* Google Fonts and Tabler Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/tabler-icons.min.css"
        rel="stylesheet"
      />

      <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar activePage="users" onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Hamburger Menu */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">User Management</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Manage platform users, search and filter by role.
            </p>

            {/* Filter and Add User Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <Filter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                roleOptions={roleOptions}
                className="w-full sm:w-auto"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-600 mr-2">
                    Rows:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto"
                >
                  + Add User
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
                <div className="flex items-center">
                  <i className="ti ti-alert-circle text-red-400 text-lg mr-2"></i>
                  <div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                    <p className="text-red-600 text-xs mt-1">
                      Please try refreshing or contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* User Table */}
                {filteredUsers.length === 0 ? (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center">
                    <p className="text-gray-600 mb-4">
                      No users found matching your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedRole('All');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <UserTable
                    users={paginatedUsers}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                )}

                {/* Pagination */}
                {filteredUsers.length > 0 && (
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
          </main>
        </div>

        {/* Modals */}
        {modalType === 'edit' && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
          />
        )}
        {modalType === 'view' && selectedUser && (
          <ViewUserModal user={selectedUser} onClose={handleCloseModal} />
        )}
        {modalType === 'delete' && selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onDeleteSuccess={handleConfirmDelete}
          />
        )}
        {modalType === 'add' && (
          <AddUserModal onClose={handleCloseModal} onSave={handleSaveUser} />
        )}
      </div>
    </>
  );
};

export default AdminUserManagement;