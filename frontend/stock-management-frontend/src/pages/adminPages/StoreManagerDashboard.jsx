// pages/StoreManager/StoreManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaBoxes,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaFileInvoice,
  FaUser,
  FaBuilding,
  FaShoppingBag,
  FaEye,
  FaBell,
  FaCalendarAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const StoreManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/dashboard/overview');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Issued': 'bg-blue-100 text-blue-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto mb-4" />
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  const { stats, pendingIssuance, recentIssuances, lowStockItems } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Store Manager Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage inventory and stock issuances</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/issuance')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-green-500/25"
            >
              <FaShoppingBag />
              Go to Issuance
            </button>
            <button
              onClick={() => navigate('/store-manager/all-requests')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
            >
              <FaFileInvoice />
              All Requests
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.totalItems || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">Total Stock</p>
          <p className="text-2xl font-bold text-emerald-600">{stats?.stock?.totalQuantity || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{stats?.stock?.lowStock || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-red-500 font-medium uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats?.stock?.outOfStock || 0}</p>
        </div>
      </div>

      {/* Request Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Pending Requests</p>
              <p className="text-2xl font-bold text-amber-600">{stats?.requests?.pending || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <FaClock className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-500 font-medium uppercase tracking-wider">Ready to Issue</p>
              <p className="text-2xl font-bold text-green-600">{stats?.requests?.approved || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Total Issued</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.requests?.issued || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FaFileInvoice className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-amber-600 text-xl mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800">⚠️ Low Stock Alert</h4>
              <p className="text-sm text-amber-700">
                The following items are below their minimum stock level:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockItems.map((item) => (
                  <span
                    key={item._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-amber-200 text-amber-700"
                  >
                    {item.name}
                    <span className="ml-1 text-amber-500">
                      ({item.quantity} {item.unit})
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/item-list')}
              className="text-sm text-amber-700 hover:text-amber-800 font-medium whitespace-nowrap"
            >
              View All →
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Issuance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaClock className="text-green-500" />
              Pending Issuance
            </h3>
            <button
              onClick={() => navigate('/admin/issuance')}
              className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              Go to Issuance <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingIssuance?.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                All caught up! No pending issuance.
              </div>
            ) : (
              pendingIssuance?.slice(0, 5).map((request) => (
                <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <FaBuilding className="text-xs" />
                        {request.department?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {request.requestedBy?.fullName || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {request.requestedItems?.length || 0} items
                      </span>
                      <button
                        onClick={() => navigate(`/admin/requests-detail/${request._id}`)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {pendingIssuance && pendingIssuance.length > 5 && (
              <div className="px-4 py-2 text-center">
                <button
                  onClick={() => navigate('/admin/issuance')}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  View all {pendingIssuance.length} pending issuances
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Issuances */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              Recent Issuances
            </h3>
            <button
              onClick={() => navigate('/admin/all-requests')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentIssuances?.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No recent issuances</div>
            ) : (
              recentIssuances?.map((request) => (
                <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <FaBuilding className="text-xs" />
                        {request.department?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {request.requestedBy?.fullName || 'Unknown'} • {formatDate(request.issuedDate)}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Issued
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/admin/issuance')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaShoppingBag className="text-green-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Issue Stock</p>
        </button>
        <button
          onClick={() => navigate('/admin/all-requests')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaFileInvoice className="text-blue-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">All Requests</p>
        </button>
        <button
          onClick={() => navigate('/admin/item-list')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaBoxes className="text-amber-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">View Items</p>
        </button>
        <button
          onClick={() => navigate('/admin/transactions')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaBoxes className="text-purple-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Transactions</p>
        </button>
      </div>
    </div>
  );
};

export default StoreManagerDashboard;