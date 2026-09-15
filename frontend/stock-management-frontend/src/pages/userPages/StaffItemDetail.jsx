// pages/userPages/StaffItemDetail.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxes,
  FaTag,
  FaCube,
  FaInfoCircle,
  FaPlus,
  FaMinus,
  FaWarehouse,
  FaClipboardList,
  FaHashtag,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const StaffItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItemDetail();
  }, [id]);

  const fetchItemDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/items/get-item/${id}`);
      if (response.data.success) {
        setItem(response.data.item);
      }
    } catch (err) {
      console.error('Error fetching item detail:', err);
      if (err.response?.status === 404) {
        setError('Item not found.');
      } else {
        setError('Failed to load item details.');
      }
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  // Get stock status
  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return {
        label: 'Out of Stock',
        color: 'text-rose-600',
        bg: 'bg-rose-100 border-rose-200',
        bar: 'bg-rose-500',
        icon: FaTimesCircle,
      };
    }
    if (quantity <= minStock) {
      return {
        label: 'Low Stock',
        color: 'text-amber-600',
        bg: 'bg-amber-100 border-amber-200',
        bar: 'bg-amber-500',
        icon: FaExclamationCircle,
      };
    }
    return {
      label: 'In Stock',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 border-emerald-200',
      bar: 'bg-emerald-500',
      icon: FaCheckCircle,
    };
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return 'IT';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color for icon
  const getItemColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };


  // Navigate to create request with pre-selected item + qty
  const handleRequestStock = () => {
    navigate('/user/create-stock-request', {
      state: { itemId: item._id },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/user/items')}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm mb-6"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Available Items
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationCircle className="text-5xl text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Item Not Found</h3>
          <p className="text-slate-600 mb-6">
            {error || 'The item you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/user/items')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Available Items
          </button>
        </div>
      </div>
    );
  }

  const status = getStockStatus(item.quantity, item.minimumStockLevel);
  const StatusIcon = status.icon;
  const canRequest = item.isActive && item.quantity > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/user/items')}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Available Items
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBoxes className="text-blue-600" />
              Item Details
            </h1>
            <p className="text-sm text-slate-500 mt-1">View complete item information</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Colored Top Bar */}
        <div className={`h-2 ${status.bar}`}></div>

        {/* Image & Header */}
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Image / Icon */}
            {item.image ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads/items/${item.image}`}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-xl ${getItemColor(item.name)} flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0`}
              >
                {getInitials(item.name)}
              </div>
            )}

            {/* Name & Meta */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{item.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200">
                  <FaHashtag className="text-[10px]" />
                  {item.code}
                </span>

                {item.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <FaTag className="text-[10px]" />
                    {item.category.name}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  <FaCube className="text-[10px]" />
                  {item.unit}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}
                >
                  <StatusIcon className="text-[10px]" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Current Stock */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaWarehouse className="text-blue-500 text-sm" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Current Stock
                </p>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {item.quantity}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  {item.unit}
                </span>
              </p>
            </div>

            {/* Min Stock */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaInfoCircle className="text-amber-500 text-sm" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Minimum Level
                </p>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {item.minimumStockLevel}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  {item.unit}
                </span>
              </p>
            </div>

            {/* Status */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`${status.color} text-sm`} />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Status
                </p>
              </div>
              <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
            </div>
          </div>

          {/* Stock Level Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Stock Level</span>
              <span>
                {item.quantity} / {item.minimumStockLevel * 2 || 1} {item.unit}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${status.bar} rounded-full transition-all duration-500`}
                style={{
                  width: `${Math.min(
                    100,
                    (item.quantity / Math.max(item.minimumStockLevel * 2, 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                Description
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          )}

          {/* Request Section */}
          {canRequest ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-1">
                    <FaClipboardList />
                    Request This Item
                  </h3>
                  <p className="text-xs text-blue-700">
                    Available: {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-3">
              

                  {/* Request Button */}
                  <button
                    onClick={handleRequestStock}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
                  >
                    <FaPlus className="text-xs" />
                    Request Stock
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <FaExclamationCircle className="text-rose-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-800">
                    {item.quantity === 0 ? 'Out of Stock' : 'Item Unavailable'}
                  </p>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {item.quantity === 0
                      ? 'This item is currently out of stock. Please check back later.'
                      : 'This item is not available for request at the moment.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-400">
        <p>Item ID: {item._id}</p>
      </div>
    </div>
  );
};

export default StaffItemDetail;