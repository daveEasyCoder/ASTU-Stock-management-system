// pages/Admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaUsers,
  FaBoxes,
  FaTags,
  FaTruck,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaFileInvoice,
  FaShoppingCart,
  FaArrowRight,
  FaUser,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const AdminDashboard = () => {
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

  // Format currency
  const formatCurrency = (amount) => {
    return (amount || 0).toFixed(2);
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

  const { stats } = dashboardData;

  // Role icons map
  const roleIcons = {
    'Admin': FaUserShield,
    'Store Manager': FaUserTie,
    'Department Head': FaUserGraduate,
    'Staff': FaUser,
  };

  const roleColors = {
    'Admin': 'text-purple-600 bg-purple-100',
    'Store Manager': 'text-blue-600 bg-blue-100',
    'Department Head': 'text-green-600 bg-green-100',
    'Staff': 'text-slate-600 bg-slate-100',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of the entire system</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Users</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Items</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalItems || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalCategories || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Suppliers</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalSuppliers || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Departments</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalDepartments || 0}</p>
        </div>
      </div>

      {/* Users by Role */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <FaUsers className="text-blue-500" />
          Users by Role
        </h3>
        <div className="flex flex-wrap gap-4">
          {stats.usersByRole?.map((role) => {
            const Icon = roleIcons[role._id] || FaUser;
            const colorClass = roleColors[role._id] || 'text-slate-600 bg-slate-100';
            return (
              <div key={role._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
                <div className={`p-1.5 rounded-full ${colorClass}`}>
                  <Icon className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{role._id}</p>
                  <p className="text-sm font-bold text-slate-800">{role.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Stock Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FaBoxes className="text-blue-500" />
            Stock Overview
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Units</span>
              <span className="text-sm font-bold text-slate-800">{stats.stock?.totalQuantity || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" />
                Low Stock
              </span>
              <span className="text-sm font-bold text-amber-600">{stats.stock?.lowStock || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <FaTimesCircle className="text-xs" />
                Out of Stock
              </span>
              <span className="text-sm font-bold text-red-600">{stats.stock?.outOfStock || 0}</span>
            </div>
          </div>
        </div>

        {/* Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FaFileInvoice className="text-blue-500" />
            Stock Requests
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600">Pending</span>
              <span className="text-sm font-bold text-amber-600">{stats.requests?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Approved</span>
              <span className="text-sm font-bold text-green-600">{stats.requests?.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Issued</span>
              <span className="text-sm font-bold text-blue-600">{stats.requests?.issued || 0}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-1">
              <span className="text-sm text-red-600">Rejected</span>
              <span className="text-sm font-bold text-red-600">{stats.requests?.rejected || 0}</span>
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FaShoppingCart className="text-blue-500" />
            Purchases
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Orders</span>
              <span className="text-sm font-bold text-slate-800">{stats.purchases?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(stats.purchases?.totalAmount)} ETB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaFileInvoice className="text-blue-500" />
              Recent Requests
            </h3>
            <button
              onClick={() => navigate('/admin/all-requests')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentActivity?.requests?.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No recent requests</div>
            ) : (
              stats.recentActivity?.requests?.map((request) => (
                <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                      <p className="text-xs text-slate-500">
                        {request.requestedBy?.fullName || 'Unknown'} • {request.department?.name || 'N/A'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      request.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      request.status === 'Issued' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaBoxes className="text-blue-500" />
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentActivity?.transactions?.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No recent transactions</div>
            ) : (
              stats.recentActivity?.transactions?.map((tx) => (
                <div key={tx._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{tx.item?.name || 'Unknown Item'}</p>
                      <p className="text-xs text-slate-500">
                        {tx.transactionType} • {tx.quantity} units
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tx.transactionType === 'Stock In' ? 'bg-emerald-100 text-emerald-700' :
                      tx.transactionType === 'Stock Out' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tx.transactionType}
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
          onClick={() => navigate('/admin/create-user')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaUsers className="text-blue-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Add User</p>
        </button>
        <button
          onClick={() => navigate('/admin/create-item')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaBoxes className="text-green-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Add Item</p>
        </button>
        <button
          onClick={() => navigate('/admin/all-requests')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaFileInvoice className="text-amber-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">All Requests</p>
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

export default AdminDashboard;