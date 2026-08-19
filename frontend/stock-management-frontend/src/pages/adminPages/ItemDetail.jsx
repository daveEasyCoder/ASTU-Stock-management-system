import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaBoxes,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationCircle,
  FaToggleOn,
  FaToggleOff,
  FaTag,
  FaBuilding,
  FaCube,
  FaInfoCircle,
  FaClock,
  FaCalendarAlt,
  FaExchangeAlt,
  FaShoppingCart,
  FaClipboardList,
  FaChartLine,
  FaTruck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHashtag,
  FaWarehouse,
  FaBarcode,
  FaPercent,
  FaBoxOpen,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const ItemDetail = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASIC_URL}/api/items/get-item/${id}`);
      if (response.data.success) {
        setItem(response.data.item);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      if (error.response?.status === 404) {
        setError('Item not found');
      } else {
        setError('Failed to load item details');
      }
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${BASIC_URL}/api/items/update-item/${id}`,
        { isActive: !item.isActive }
      );
      if (response.data.success) {
        toast.success(`Item ${item.isActive ? 'deactivated' : 'activated'} successfully!`);
        fetchItemDetails();
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${BASIC_URL}/items/delete-item/${id}`, {
        withCredentials: true
      });
      toast.success('Item deleted successfully!');
      setTimeout(() => {
        navigate('/admin/item-list');
      }, 1500);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

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

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getStockStatus = () => {
    if (!item) return { label: 'N/A', color: 'bg-gray-100 text-gray-700', icon: FaInfoCircle };
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-700', icon: FaExclamationCircle };
    }
    if (item.quantity <= item.minimumStockLevel) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: FaExclamationCircle };
    }
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle };
  };

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

  const stockStatus = item ? getStockStatus() : { label: 'N/A', color: '', icon: FaInfoCircle };
  const StatusIcon = stockStatus.icon;

  // Quick actions data
  const quickActions = [
    {
      label: 'Transactions',
      icon: FaExchangeAlt,
      color: 'blue',
      path: `/admin/item-transactions/${item?._id}`,
      description: 'View all stock movements'
    },
    {
      label: 'Purchase History',
      icon: FaShoppingCart,
      color: 'emerald',
      path: `/admin/item-purchases/${item?._id}`,
      description: 'View all purchases'
    },
    {
      label: 'Stock Requests',
      icon: FaClipboardList,
      color: 'purple',
      path: `/admin/item-requests/${item?._id}`,
      description: 'View all requests'
    },
    {
      label: 'Adjust Stock',
      icon: FaChartLine,
      color: 'amber',
      path: `/admin/item-stock-adjust/${item?._id}`,
      description: 'Manual adjustment'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <FaExclamationCircle className="text-rose-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Item Not Found</h3>
          <p className="text-slate-600 mb-6">{error || 'The item you are looking for does not exist'}</p>
          <button
            onClick={() => navigate('/admin/item-list')}
            className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Item List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button - Responsive */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => navigate('/admin/item-list')}
            className="flex items-center cursor-pointer text-slate-600 hover:text-blue-600 transition-colors group text-sm sm:text-base self-start"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Item List
          </button>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusBadge(item.isActive)}`}>
              {item.isActive ? (
                <><FaCheckCircle className="mr-1" /> Active</>
              ) : (
                <><FaTimesCircle className="mr-1" /> Inactive</>
              )}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${stockStatus.color}`}>
              <StatusIcon className="mr-1" />
              {stockStatus.label}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Cover - Responsive */}
          <div className={`h-20 sm:h-28 ${
            item.isActive ? (
              item.quantity === 0 ? 'bg-linear-to-r from-rose-500 to-rose-600' :
              item.quantity <= item.minimumStockLevel ? 'bg-linear-to-r from-amber-500 to-amber-600' :
              'bg-linear-to-r from-emerald-500 to-emerald-600'
            ) : 'bg-linear-to-r from-slate-400 to-slate-500'
          } relative`}>
            <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"></div>
            <div className="relative h-full flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar - Smaller on mobile */}
                {item.image ? (
                  <img
                    src={`${BASIC_URL}/uploads/items/${item.image}`}
                    alt={item.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 sm:border-4 border-white shadow-lg object-cover -mt-6 sm:-mt-5"
                  />
                ) : (
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 sm:border-4 border-white shadow-lg flex items-center justify-center text-white text-xl sm:text-3xl ${getItemColor(item.name)} -mt-6 sm:-mt-5`}>
                    <FaBoxes />
                  </div>
                )}
                <div className="text-white drop-shadow-md">
                  <h1 className="text-base sm:text-2xl font-bold truncate max-w-[180px] sm:max-w-md">{item.name}</h1>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="bg-white/20 px-1.5 py-0.5 sm:px-2 rounded-full flex items-center gap-1">
                      <FaHashtag className="text-white/80 text-[10px] sm:text-xs" /> <span className="truncate max-w-[60px] sm:max-w-none">{item.code}</span>
                    </span>
                    {item.category && (
                      <span className="bg-white/20 px-1.5 py-0.5 sm:px-2 rounded-full flex items-center gap-1">
                        <FaTag className="text-white/80 text-[10px] sm:text-xs" /> <span className="truncate max-w-[60px] sm:max-w-none">{item.category.name}</span>
                      </span>
                    )}
                    <span className="bg-white/20 px-1.5 py-0.5 sm:px-2 rounded-full flex items-center gap-1">
                      <FaCube className="text-white/80 text-[10px] sm:text-xs" /> {item.unit}
                    </span>
                  </div>
                </div>
              </div>
              {/* Action Buttons - Hidden on mobile, shown in dropdown */}
              <div className="hidden sm:flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/admin/update-item/${item._id}`)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`px-4 py-2 cursor-pointer ${
                    item.isActive ? 'bg-amber-500/80 hover:bg-amber-600/80' : 'bg-emerald-500/80 hover:bg-emerald-600/80'
                  } text-white backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-sm font-medium`}
                >
                  {item.isActive ? <FaToggleOff /> : <FaToggleOn />}
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-rose-500/80 hover:bg-rose-600/80 text-white backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FaTrash /> Delete
                </button>
              </div>
              {/* Mobile action toggle */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="sm:hidden absolute top-2 right-3 text-white/80 hover:text-white"
              >
                {showQuickActions ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
              </button>
            </div>
            {/* Mobile quick actions dropdown */}
            {showQuickActions && (
              <div className="sm:hidden absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-2xl p-3 z-20 border-t border-slate-200">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { navigate(`/admin/edit-item/${item._id}`); setShowQuickActions(false); }}
                    className="w-full flex items-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    <FaEdit className="text-blue-600" /> Edit Item
                  </button>
                  <button
                    onClick={() => { handleToggleStatus(); setShowQuickActions(false); }}
                    className={`w-full flex items-center gap-2 p-2.5 ${item.isActive ? 'bg-amber-50 hover:bg-amber-100' : 'bg-emerald-50 hover:bg-emerald-100'} rounded-lg transition-colors text-sm`}
                  >
                    {item.isActive ? <FaToggleOff className="text-amber-600" /> : <FaToggleOn className="text-emerald-600" />}
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setShowDeleteModal(true); setShowQuickActions(false); }}
                    className="w-full flex items-center gap-2 p-2.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors text-sm text-rose-600"
                  >
                    <FaTrash /> Delete Item
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6">
            {/* Summary Stats Cards - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaBoxOpen className="text-sm sm:text-xl" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Stock</p>
                  <p className="text-base sm:text-2xl font-bold text-slate-800">{item.quantity} <span className="text-xs sm:text-sm font-normal text-slate-500">{item.unit}</span></p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <FaPercent className="text-sm sm:text-xl" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Min Stock</p>
                  <p className="text-base sm:text-2xl font-bold text-slate-800">{item.minimumStockLevel} <span className="text-xs sm:text-sm font-normal text-slate-500">{item.unit}</span></p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <FaBarcode className="text-sm sm:text-xl" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Code</p>
                  <p className="text-sm sm:text-xl font-bold text-slate-800 truncate max-w-15 sm:max-w-full">{item.code}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FaWarehouse className="text-sm sm:text-xl" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Category</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-800 leading-5">{item.category?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Two-column details - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Details (spans 2 columns on large) */}
              <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                    <FaInfoCircle className="text-blue-500" /> Description
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
                    {item.description ? (
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{item.description}</p>
                    ) : (
                      <p className="text-sm sm:text-base text-slate-400 italic">No description provided</p>
                    )}
                  </div>
                </div>

          

                {/* Timestamps */}
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                    <FaClock className="text-blue-500" /> Timeline
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Created At</p>
                      <p className="text-slate-700 flex items-center gap-1 text-sm sm:text-base"><FaCalendarAlt className="text-slate-400" /> {formatDate(item.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p className="text-slate-700 flex items-center gap-1 text-sm sm:text-base"><FaClock className="text-slate-400" /> {formatDate(item.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions - Responsive */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                  <FaChartLine className="text-blue-500" /> Quick Actions
                </h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    const colorMap = {
                      blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
                      emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
                      purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
                      amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                    };
                    const hoverMap = {
                      blue: 'hover:border-blue-200 hover:bg-blue-50',
                      emerald: 'hover:border-emerald-200 hover:bg-emerald-50',
                      purple: 'hover:border-purple-200 hover:bg-purple-50',
                      amber: 'hover:border-amber-200 hover:bg-amber-50'
                    };
                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-slate-200 ${hoverMap[action.color]} transition-all group text-sm`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorMap[action.color]} flex items-center justify-center transition-colors`}>
                          <Icon className="text-sm sm:text-base" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-800 text-xs sm:text-sm">{action.label}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">{action.description}</p>
                        </div>
                        <FaArrowLeft className="rotate-180 text-slate-400 group-hover:text-slate-600 transition-colors text-xs sm:text-sm" />
                      </button>
                    );
                  })}
                </div>

                {/* Status Legend - Responsive */}
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-500 mt-0.5 text-sm sm:text-base" />
                    <div className="text-xs sm:text-sm">
                      <p className="text-blue-700 font-medium">Stock Status Indicator</p>
                      <div className="mt-1 space-y-0.5 text-blue-600">
                        <div><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> In Stock &gt; Min Level</div>
                        <div><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Low Stock ≤ Min Level</div>
                        <div><span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Out of Stock = 0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Item ID: {item._id}</p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-rose-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Delete Item</h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete <strong>{item.name}</strong>?
              </p>
              <p className="text-sm text-rose-500 mb-6">
                ⚠️ This action cannot be undone. All related data may be affected.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

export default ItemDetail;