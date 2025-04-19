import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance.ts'; // Axios instance
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
        axios.get('/api/students/')
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

  const handleAdd = () => {
    setSelectedUser({
      username: '',
      email: '',
      role: 'Student',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true
    });
    setModalType('add');
  };

  const handleEdit = (user) => {
    setSelectedUser({
      ...user,
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'Student',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
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

  const getEndpointByRole = (role) => {
    switch (role) {
      case 'Admin':
        return '/api/admins/create';
      case 'Teacher':
        return '/api/teachers/create';
      case 'Student':
        return '/api/students/create';
      default:
        return '/api/students/';
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const endpoint = getEndpointByRole(selectedUser.role);
      await axios.delete(`${endpoint}/${selectedUser._id}`);
      setUsers(users.filter(user => user._id !== selectedUser._id));
      handleCloseModal();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const endpoint = getEndpointByRole(userData.role);

      if (userData._id) {
        // Update existing user
        const response = await axios.put(`${endpoint}/${userData._id}`, userData);
        setUsers(users.map(u => u._id === userData._id ? response.data.data : u));
      } else {
        // Add new user
        const response = await axios.post(endpoint, userData);
        setUsers([...users, response.data.data]);
      }

      handleCloseModal();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
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

      <main className="flex bg-[linear-gradient(0deg,#F5F7FB_0%,#F5F7FB_100%),#FFF] min-h-screen">
        <Sidebar activePage="users" />
        <div className="flex-1 ml-64">
          <Header />
          <section className="p-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2.5">User Management</h1>
            <p className="text-base text-gray-500 mb-6">
              Manage platform users, search and filter by role.
            </p>

            <div className="flex justify-between items-center mb-4">
              <Filter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                roleOptions={roleOptions}
              />

              <div className="flex items-center gap-2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  + Add User
                </button>
              </div>
            </div>

            {/* Error */}
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

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* User Table */}
                {filteredUsers.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl shadow-lg text-center">
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
          </section>
        </div>
      </main>

      {/* Modals */}
      {modalType === 'edit' && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
      {modalType === 'view' && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
      {modalType === 'delete' && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
        />
      )}
      {modalType === 'add' && (
        <AddUserModal
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </>
  );
};

export default AdminUserManagement;
