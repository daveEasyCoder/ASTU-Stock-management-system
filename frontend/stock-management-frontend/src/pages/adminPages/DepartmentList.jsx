import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBuilding,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaCode,
  FaUniversity,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const DepartmentList = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsPerPage] = useState(9);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASIC_URL}/api/departments/get-departments`);
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  // Filter departments
  const filteredDepartments = departments.filter(department => {
    const matchesSearch = 
      department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : 
                         filterStatus === 'active' ? department.isActive : 
                         !department.isActive;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastDepartment = currentPage * departmentsPerPage;
  const indexOfFirstDepartment = indexOfLastDepartment - departmentsPerPage;
  const currentDepartments = filteredDepartments.slice(indexOfFirstDepartment, indexOfLastDepartment);
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Handle delete department
  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/departments/delete-department/${selectedDepartment._id}`, {
        withCredentials: true
      });
      toast.success('Department deleted successfully!');
      fetchDepartments();
      setShowDeleteModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (department) => {
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/departments/update-department/${department._id}`,
        { isActive: !department.isActive }
      );
      if (response.data.success) {
        toast.success(`Department ${department.isActive ? 'deactivated' : 'activated'} successfully!`);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error toggling department status:', error);
      toast.error('Failed to update department status');
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  // Get department initials for avatar
  const getDepartmentInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for department icon
  const getDepartmentColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
      'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
              <p className="mt-1 text-gray-600">
                Manage all departments in the organization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaBuilding className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Total: {filteredDepartments.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/create-department')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <FaPlus />
                Add Department
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
                placeholder="Search by name, code, or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <FaTimes size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        {filteredDepartments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaExclamationCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No departments have been created yet'}
            </p>
            <button
              onClick={() => navigate('/admin/create-department')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create First Department
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDepartments.map((department) => (
                <div
                  key={department._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Department Header */}
                  <div className={`h-2 ${department.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <div className="p-5">
                    {/* Icon and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-14 h-14 rounded-xl ${getDepartmentColor(department.name)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                        <FaUniversity className="text-2xl" />
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(department.isActive)}`}>
                        {department.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                    </div>

                    {/* Department Info */}
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {department.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <FaCode className="mr-1" />
                          {department.code}
                        </span>
                      </div>
                      {department.description ? (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                          {department.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-2">No description</p>
                      )}
                    </div>

                    {/* User Count */}
                    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                      <FaUsers className="text-blue-500 text-sm" />
                      <span className="text-sm text-gray-700">
                        <strong>{department.userCount || 0}</strong> users assigned
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <FaCalendarAlt className="mr-1.5" />
                        Created: {formatDate(department.createdAt)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaClock className="mr-1.5" />
                        Updated: {formatDate(department.updatedAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(department)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title={department.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {department.isActive ? (
                            <FaToggleOn className="text-2xl text-blue-500" />
                          ) : (
                            <FaToggleOff className="text-2xl text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/update-department/${department._id}`)}
                          className="p-1.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                          title="Edit Department"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDepartment(department);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Department"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/department-detail/${department._id}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        View Details
                        <FaEye size={12} />
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
                  Showing {indexOfFirstDepartment + 1} - {Math.min(indexOfLastDepartment, filteredDepartments.length)} of {filteredDepartments.length} departments
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Department</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{selectedDepartment.name}</strong>?
              </p>
              <p className="text-sm text-red-500 mb-4">
                ⚠️ This department has <strong>{selectedDepartment.userCount || 0}</strong> assigned users. Deleting it may affect these users.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDepartment(null);
                  }}
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

export default DepartmentList;