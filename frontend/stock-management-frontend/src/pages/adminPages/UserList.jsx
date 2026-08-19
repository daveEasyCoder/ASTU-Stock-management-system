import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
  FaExclamationCircle,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaUserCog
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';


const UserList = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASIC_URL}/api/users/get-users`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'Store Manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'Department Head': 'bg-green-100 text-green-700 border-green-200',
      'Staff': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get status badge color
  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  // Get initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar
  const getAvatarColor = (fullName) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = fullName ? fullName.length % colors.length : 0;
    return colors[index];
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    const matchesStatus = selectedStatus !== '' ? user.isActive === (selectedStatus === 'active') : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Get unique roles for filter
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-gray-600">
                Manage all users in the Astu Stock Management System
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaUsers className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Total: {filteredUsers.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/create-user')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25"
              >
                + Add User
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {(selectedRole || selectedStatus) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* User Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaExclamationCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedRole || selectedStatus 
                ? 'Try adjusting your search or filters' 
                : 'No users have been created yet'}
            </p>
            <button
              onClick={() => navigate('/admin/create-user')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create First User
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Avatar Section */}
                  <div className="relative">
                    <div className={`h-24 w-full bg-linear-to-r from-blue-50 to-blue-100`}>
                      {/* Status indicator */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-8 left-4">
                      {user.profileImage ? (
                        <img
                          src={`${BASIC_URL}/uploads/profiles/${user.profileImage}`}
                          alt={user.fullName}
                          className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-semibold text-xl ${getAvatarColor(user.fullName)}`}>
                          {getInitials(user.fullName)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="pt-10 px-4 pb-4">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <FaEnvelope className="text-xs" />
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <FaPhone className="text-xs" />
                        {user.phone}
                      </p>
                    </div>

                    {/* Department */}
                    <div className="mb-3">
                      {user.department ? (
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-blue-500 text-sm" />
                          <span className="text-sm text-gray-700">
                            {user.department.name}
                            {user.department.code && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({user.department.code})
                              </span>
                            )}
                          </span>
                          {!user.department.isActive && (
                            <span className="text-xs text-red-500 ml-1">(Inactive)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No department assigned</span>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        <FaUserCog className="mr-1 text-xs" />
                        <span className='flex-none'> {user.role === 'Department Head' ? 'Dep Head' : user.role}</span>
                      </span>
                      
                      {/* Detail Button */}
                      <button
                        onClick={() => navigate(`/admin/user-detail/${user._id}`)}
                        className="flex items-center cursor-pointer gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <FaEye className="text-xs" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;