import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaBuilding,
  FaCode,
  FaInfoCircle,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUserPlus,
  FaTimesCircle,
  FaSpinner,
  FaExclamationCircle,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaUniversity,
  FaEye,
  FaPlus,
  FaUserCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const DepartmentDetail = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchDepartmentDetails();
  }, [id]);

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASIC_URL}/api/departments/get-department/${id}`);
      if (response.data.success) {
        setDepartment(response.data.department);
        setUsers(response.data.department.users || []);
      }
    } catch (error) {
      console.error('Error fetching department details:', error);
      if (error.response?.status === 404) {
        setError('Department not found');
      } else {
        setError('Failed to load department details');
      }
      toast.error('Failed to load department details');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/departments/update-department/${id}`,
        { isActive: !department.isActive }
      );
      if (response.data.success) {
        toast.success(`Department ${department.isActive ? 'deactivated' : 'activated'} successfully!`);
        fetchDepartmentDetails();
      }
    } catch (error) {
      console.error('Error toggling department status:', error);
      toast.error('Failed to update department status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete department
  const handleDeleteDepartment = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/departments/delete-department/${id}`, {
        withCredentials: true
      });
      toast.success('Department deleted successfully!');
      setTimeout(() => {
        navigate('/admin/department-list');
      }, 1500);
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
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

  // Get avatar color
  const getAvatarColor = (fullName) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = fullName ? fullName.length % colors.length : 0;
    return colors[index];
  };

  // Get department color
  const getDepartmentColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  // Get status icon
  const getStatusIcon = (isActive) => {
    return isActive ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading department details...</p>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Department Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The department you are looking for does not exist'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Department List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/department-list')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Department List
          </button>
        </div>

        {/* Department Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className={`h-32 ${department.isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
            <div className="flex items-center justify-end h-full px-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30">
                {getStatusIcon(department.isActive)}
                <span className="ml-2">{department.isActive ? 'Active' : 'Inactive'}</span>
              </span>
            </div>
          </div>
          
          {/* Profile Section */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-12 mb-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 rounded-xl ${getDepartmentColor(department.name)} flex items-center justify-center text-white text-3xl shadow-lg border-4 border-white`}>
                  <FaUniversity />
                </div>
              </div>

              {/* Department Info */}
              <div className="flex-1 mt-4 md:mt-0 md:ml-6">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {department.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(department.isActive)}`}>
                        {department.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        <FaCode className="mr-1" />
                        {department.code}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                        <FaUsers className="mr-1" />
                        {users.length} Users
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/admin/update-department/${department._id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Department
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`px-4 py-2 ${
                    department.isActive 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2`}
                >
                  {department.isActive ? <FaToggleOff /> : <FaToggleOn />}
                  {department.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-red-500/25 flex items-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>

            {/* Department Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Department Name</label>
                    <p className="text-sm text-gray-900 font-medium">{department.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Department Code</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaCode className="text-gray-400" />
                      {department.code}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    {department.description ? (
                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                        {department.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No description provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Status & Metadata
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(department.isActive)}`}>
                        {department.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Department ID</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaBuilding className="text-gray-400" />
                      {department._id}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Total Users</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaUsers className="text-gray-400" />
                      {users.length} users in this department
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      {formatDate(department.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      {formatDate(department.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaUsers />
                  Users in {department.name}
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  {users.length} user{users.length !== 1 ? 's' : ''} assigned to this department
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/create-user', { state: { departmentId: department._id } })}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Add User
              </button>
            </div>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600 mb-4">
                  No users are currently assigned to this department
                </p>
                <button
                  onClick={() => navigate('/admin/create-user', { state: { departmentId: department._id } })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <FaPlus />
                  Add First User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === users.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.profileImage ? (
                              <img
                                src={`${BASIC_URL}/uploads/profiles/${user.profileImage}`}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(user.fullName)}`}>
                                {getInitials(user.fullName)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/user-detail/${user._id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-auto"
                          >
                            <FaEye className="text-xs" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/update-department/${department._id}`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaEdit className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Edit Department</h4>
                <p className="text-xs text-blue-600">Update department information</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/create-user', { state: { departmentId: department._id } })}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaUserPlus className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Add User</h4>
                <p className="text-xs text-green-600">Create new user in this department</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/user-list', { state: { departmentId: department._id } })}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FaUsers className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-800">View All Users</h4>
                <p className="text-xs text-purple-600">Browse all users in this department</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Department</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{department.name}</strong>?
              </p>
              <p className="text-sm text-red-500 mb-4">
                ⚠️ This department has <strong>{users.length}</strong> assigned user{users.length !== 1 ? 's' : ''}. Deleting it may affect these users.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDepartment}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {actionLoading ? (
                    <><FaSpinner className="animate-spin" /> Deleting...</>
                  ) : (
                    <><FaTrash /> Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;