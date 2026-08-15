import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
  FaExclamationCircle,
  FaInfoCircle,
  FaClock,
  FaIdCard,
  FaShieldAlt,
  FaUserCog,
  FaKey,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const UserDetail = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASIC_URL}/api/users/get-user/${id}`);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user details');
      }
      toast.error('Failed to load user details');
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

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      'Admin': <FaShieldAlt className="text-purple-500" />,
      'Store Manager': <FaUserCog className="text-blue-500" />,
      'Department Head': <FaUserCheck className="text-green-500" />,
      'Staff': <FaUser className="text-gray-500" />
    };
    return icons[role] || <FaUser className="text-gray-500" />;
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

  // Handle delete user
  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/api/users/delete-user/${id}`, {
        withCredentials: true
      });
      toast.success('User deleted successfully');
      navigate('/admin/user-list');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/users/update-user/${id}`,
        { isActive: !user.isActive }
      );
      if (response.data.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
      setShowStatusModal(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    
    setActionLoading(true);
    try {
      const response = await axios.post(
        `${BASIC_URL}/api/users/reset-password/${id}`,
        {}
      );
      if (response.data.success) {
       alert('Password reset successfully. New password: ' + response.data.temporaryPassword);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The user you are looking for does not exist'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to User List
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-linear-to-r from-blue-600 to-blue-700"></div>
          
          {/* Profile Section */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-10 mb-6">
              {/* Avatar */}
              <div className="shrink-0">
                {user.profileImage ? (
                  <img
                    src={`${BASIC_URL}/uploads/profiles/${user.profileImage}`}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-semibold text-3xl ${getAvatarColor(user.fullName)}`}>
                    {getInitials(user.fullName)}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 mt-4 md:mt-0 md:ml-6">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {user.fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.isActive)}`}>
                        {user.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                      {user.department && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                          <FaBuilding className="mr-1" />
                          {user.department.name}
                          {user.department.code && (
                            <span className="ml-1 text-indigo-500">({user.department.code})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/admin/update-user/${user._id}`)}
                  className="px-4 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
                >
                  <FaEdit />
                  Edit User
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-yellow-500/25 flex items-center gap-2"
                >
                  <FaKey />
                  Reset Password
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`px-4 py-2 ${
                    user.isActive 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2`}
                >
                  {user.isActive ? <FaUserTimes /> : <FaUserCheck />}
                  {user.isActive ? 'Deactivate' : 'Activate'}
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

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Full Name</label>
                    <p className="text-sm text-gray-900 font-medium">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email Address</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Phone Number</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {user.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role & Department */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaUserTag className="text-blue-600" />
                  Role & Department
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Role</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Department</label>
                    {user.department ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <FaBuilding className="text-gray-400" />
                          {user.department.name}
                        </p>
                        {user.department.code && (
                          <p className="text-xs text-gray-500">Code: {user.department.code}</p>
                        )}
                        {user.department.description && (
                          <p className="text-xs text-gray-500">{user.department.description}</p>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.department.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No department assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Account Status</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      {user.isActive ? (
                        <><FaCheckCircle className="text-green-500" /> Active</>
                      ) : (
                        <><FaTimesCircle className="text-red-500" /> Inactive</>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">User ID</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaIdCard className="text-gray-400" />
                      {user._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Account Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{user.fullName}</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
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

        {/* Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className={`w-16 h-16 ${user.isActive ? 'bg-orange-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {user.isActive ? (
                    <FaUserTimes className="text-orange-600 text-2xl" />
                  ) : (
                    <FaUserCheck className="text-green-600 text-2xl" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {user.isActive ? 'Deactivate' : 'Activate'} User
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} <strong>{user.fullName}</strong>?
                  {user.isActive ? ' This will prevent them from accessing the system.' : ' This will restore their access to the system.'}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                    className={`px-4 py-2 ${
                      user.isActive 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white rounded-lg transition-colors flex items-center gap-2`}
                  >
                    {actionLoading ? (
                      <><FaSpinner className="animate-spin" /> Processing...</>
                    ) : (
                      <>{user.isActive ? 'Deactivate' : 'Activate'}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;