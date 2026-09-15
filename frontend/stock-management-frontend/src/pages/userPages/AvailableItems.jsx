// pages/AvailableItems.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch,
  FaBoxes,
  FaTag,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaCube,
  FaEye,
  FaPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';


const AvailableItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/items/get-items');
      if (response.data.success) {
        // Filter: Only active items with stock > 0
        const availableItems = response.data.items.filter(
          item => item.isActive && item.quantity > 0
        );
        setItems(availableItems);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load available items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories/get-categories');
      if (response.data.success) {
        setCategories(response.data.categories.filter(c => c.isActive));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter items (client-side)
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category?._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Get stock status
  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-100' };
    }
    if (quantity <= minStock) {
      return { label: 'Low Stock', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    }
    return { label: 'In Stock', color: 'text-green-500', bg: 'bg-green-100' };
  };

  // Get initials for item icon
  const getInitials = (name) => {
    if (!name) return 'IT';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getItemColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading available items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBoxes className="text-blue-600" />
              Available Items
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse items currently in stock
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {filteredItems.length} items available
            </span>
            <button
              onClick={() => navigate('/user/create-stock-request')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/25"
            >
              <FaPlus className="text-xs" />
              Request Stock
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationCircle className="text-4xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No items available</h3>
          <p className="text-slate-600">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'No items are currently in stock'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const status = getStockStatus(item.quantity, item.minimumStockLevel);
            const StatusIcon = status.label === 'In Stock' ? FaCheckCircle : FaExclamationCircle;
            
            return (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Stock Status Bar */}
                <div className={`h-1 ${
                  status.label === 'In Stock' ? 'bg-green-500' :
                  status.label === 'Low Stock' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />

                <div className="p-4">
                  {/* Icon and Stock Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${getItemColor(item.name)} flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0`}>
                      {getInitials(item.name)}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="mr-1 text-xs" />
                      {status.label}
                    </span>
                  </div>

                  {/* Item Info */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400">{item.code}</p>
                  </div>

                  {/* Stock Info */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      <FaCube className="text-slate-400 text-xs" />
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    {item.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        <FaTag className="mr-1 text-xs" />
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  {/* Minimum Stock Level */}
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <span>Min Stock: {item.minimumStockLevel} {item.unit}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/user/staff-item-detail/${item._id}`)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-xs" />
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/user/create-stock-request', { state: { itemId: item._id } })}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FaPlus className="text-xs" />
                      Request
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableItems;