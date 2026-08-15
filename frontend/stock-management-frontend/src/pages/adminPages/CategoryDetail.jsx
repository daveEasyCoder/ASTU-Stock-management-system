import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaTags,
  FaInfoCircle,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationCircle,
  FaToggleOn,
  FaToggleOff,
  FaBoxes,
  FaUser,
  FaBuilding,
  FaList,
  FaPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const CategoryDetail = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASIC_URL}/api/categories/get-category/${id}`);
      if (response.data.success) {
        setCategory(response.data.category);
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      if (error.response?.status === 404) {
        setError('Category not found');
      } else {
        setError('Failed to load category details');
      }
      toast.error('Failed to load category details');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/categories/update-category/${id}`,
        { isActive: !category.isActive }
      );
      if (response.data.success) {
        toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
        setCategory(response.data.category);
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/api/categories/delete-category/${id}`, {
        withCredentials: true
      });
      toast.success('Category deleted successfully!');
      setTimeout(() => {
        navigate('/admin/category-list');
      }, 1500);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
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

  // Get category initials for avatar
  const getCategoryInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for category icon
  const getCategoryColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
      'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
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
          <p className="text-gray-600 text-lg">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Category Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The category you are looking for does not exist'}</p>
          <button
            onClick={() => navigate('/admin/category-list')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Category List
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
            onClick={() => navigate('/admin/category-list')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Category List
          </button>
        </div>

        {/* Category Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className={`h-32 ${category.isActive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
            <div className="flex items-center justify-end h-full px-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30">
                {getStatusIcon(category.isActive)}
                <span className="ml-2">{category.isActive ? 'Active' : 'Inactive'}</span>
              </span>
            </div>
          </div>
          
          {/* Profile Section */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-12 mb-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 rounded-xl ${getCategoryColor(category.name)} flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white`}>
                  {getCategoryInitials(category.name)}
                </div>
              </div>

              {/* Category Info */}
              <div className="flex-1 mt-4 md:mt-0 md:ml-6">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {category.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(category.isActive)}`}>
                        {category.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        <FaTags className="mr-1" />
                        Category
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/admin/update-category/${category._id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Category
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`px-4 py-2 ${
                    category.isActive 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2`}
                >
                  {category.isActive ? <FaToggleOff /> : <FaToggleOn />}
                  {category.isActive ? 'Deactivate' : 'Activate'}
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

            {/* Category Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Category Name</label>
                    <p className="text-sm text-gray-900 font-medium">{category.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    {category.description ? (
                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                        {category.description}
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(category.isActive)}`}>
                        {category.isActive ? (
                          <><FaCheckCircle className="mr-1" /> Active</>
                        ) : (
                          <><FaTimesCircle className="mr-1" /> Inactive</>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Category ID</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaTags className="text-gray-400" />
                      {category._id}
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
                      {formatDate(category.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      {formatDate(category.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Items Section (Optional - Add when you have items module) */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <FaBoxes className="text-blue-600" />
                  Related Items
                </h3>
                <button
                  onClick={() => navigate('/admin/create-item', { state: { categoryId: category._id } })}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <FaPlus size={12} />
                  Add Item
                </button>
              </div>
              <div className="text-center py-6">
                <FaBoxes className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No items found in this category</p>
                <p className="text-xs text-gray-400 mt-1">Items will appear here once they are added</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaEdit className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Edit Category</h4>
                <p className="text-xs text-blue-600">Update category information</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaPlus className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Add Item</h4>
                <p className="text-xs text-green-600">Create new item in this category</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FaList className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-800">View Items</h4>
                <p className="text-xs text-purple-600">Browse all items in this category</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Category</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{category.name}</strong>?
              </p>
              <p className="text-sm text-red-500 mb-6">
                ⚠️ This action cannot be undone. All items in this category may be affected.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
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

export default CategoryDetail;