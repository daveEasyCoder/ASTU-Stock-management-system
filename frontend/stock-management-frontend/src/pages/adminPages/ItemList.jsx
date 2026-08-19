import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBoxes,
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
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaTag,
  FaBuilding,
  FaCube,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
  FaCalendarAlt,
  FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const ItemList = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Fetch items and categories
  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASIC_URL}/api/items/get-items`);
      if (response.data.success) {
        setItems(response.data.items);
        // Calculate stats
        const total = response.data.items.length;
        const lowStock = response.data.items.filter(
          item => item.isActive && item.quantity <= item.minimumStockLevel && item.quantity > 0
        ).length;
        const outOfStock = response.data.items.filter(
          item => item.isActive && item.quantity === 0
        ).length;
        setStats({ total, lowStock, outOfStock });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASIC_URL}/api/categories/get-categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? item.category?._id === filterCategory : true;
    const matchesStatus = filterStatus === 'all' ? true : 
                         filterStatus === 'active' ? item.isActive : 
                         !item.isActive;
    const matchesStock = filterStock === 'all' ? true :
                        filterStock === 'low' ? (item.quantity <= item.minimumStockLevel && item.quantity > 0) :
                        filterStock === 'out' ? item.quantity === 0 :
                        filterStock === 'in' ? (item.quantity > item.minimumStockLevel) : true;
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('all');
    setFilterStock('all');
    setCurrentPage(1);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/api/items/delete-item/${selectedItem._id}`, {
        withCredentials: true
      });
      toast.success('Item deleted successfully!');
      fetchItems();
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (item) => {
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/items/update-item/${item._id}`,
        { isActive: !item.isActive }
      );
      if (response.data.success) {
        toast.success(`Item ${item.isActive ? 'deactivated' : 'activated'} successfully!`);
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error('Failed to update item status');
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

  // Get stock status
  const getStockStatus = (item) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: FaExclamationCircle };
    }
    if (item.quantity <= item.minimumStockLevel) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: FaExclamationTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: FaCheckCircle };
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'I';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color for item icon
  const getItemColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
      'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  // Get stock icon
  const getStockIcon = (item) => {
    if (item.quantity === 0) return <FaExclamationCircle className="text-red-500" />;
    if (item.quantity <= item.minimumStockLevel) return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaCheckCircle className="text-green-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading items...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
              <p className="mt-1 text-gray-600">
                Manage all items in the inventory
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaBoxes className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Total: {filteredItems.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/create-item')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <FaPlus />
                Add Item
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBoxes className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaExclamationTriangle className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FaExclamationCircle className="text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filterStock}
                onChange={(e) => {
                  setFilterStock(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
              >
                <option value="all">All Stock</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              {(searchTerm || filterCategory || filterStatus !== 'all' || filterStock !== 'all') && (
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

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaExclamationCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory || filterStatus !== 'all' || filterStock !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No items have been created yet'}
            </p>
            <button
              onClick={() => navigate('/admin/create-item')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create First Item
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const StockIcon = stockStatus.icon;
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                  >
                    {/* Status Bar */}
                    <div className={`h-2 ${
                      item.isActive ? (
                        item.quantity === 0 ? 'bg-red-500' :
                        item.quantity <= item.minimumStockLevel ? 'bg-yellow-500' :
                        'bg-green-500'
                      ) : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="p-4">
                      {/* Image and Status */}
                      <div className="flex items-start justify-between mb-3">
                        {item.image ? (
                          <img
                            src={`${BASIC_URL}/uploads/items/${item.image}`}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-lg ${getItemColor(item.name)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                            <FaBoxes className="text-2xl" />
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.isActive)}`}>
                          {item.isActive ? (
                            <><FaCheckCircle className="mr-1" /> Active</>
                          ) : (
                            <><FaTimesCircle className="mr-1" /> Inactive</>
                          )}
                        </span>
                      </div>

                      {/* Item Info */}
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {item.code}
                          </span>
                          {item.category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {item.category.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <StockIcon className="text-sm" />
                          <span className="text-sm font-medium">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>

                      {/* Min Stock */}
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <FaInfoCircle className="mr-1.5" />
                        Min Stock: {item.minimumStockLevel} {item.unit}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        <FaClock className="mr-1.5" />
                        Updated: {formatDate(item.updatedAt)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title={item.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {item.isActive ? (
                              <FaToggleOn className="text-2xl text-blue-500" />
                            ) : (
                              <FaToggleOff className="text-2xl text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/update-item/${item._id}`)}
                            className="p-1.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                            title="Edit Item"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Item"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => navigate(`/admin/item-detail/${item._id}`)}
                          className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          Details
                          <FaEye size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
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
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Item</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{selectedItem.name}</strong>?
              </p>
              <p className="text-sm text-red-500 mb-6">
                ⚠️ This action cannot be undone. All related data may be affected.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
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

export default ItemList;