// pages/DepartmentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaSpinner,
  FaExclamationCircle,
  FaFileInvoice,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaUser,
  FaEye,
  FaBell,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/dashboard/department-dashboard');
      if (response.data.success) {
        setDashboardData(response.data);
        setDepartment(response.data.department);
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
        <FaExclamationCircle className="text-4xl text-amber-500 mx-auto mb-4" />
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  const { stats, recentRequests, pendingApprovals } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Department Head Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {department?.name} ({department?.code})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user/pending-approvals')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaBell />
              {stats.pending > 0 ? `${stats.pending} Pending` : 'No Pending'}
            </button>
            <button
              onClick={() => navigate('/user/department-report')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/25"
            >
              <FaFileInvoice />
              View Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Requests</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalRequests || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-green-500 font-medium uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Issued</p>
          <p className="text-2xl font-bold text-blue-600">{stats.issued || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-500 font-medium uppercase tracking-wider">Staff</p>
          <p className="text-2xl font-bold text-purple-600">{stats.staffCount || 0}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-600 text-xl" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {stats.lowStockItems} item{stats.lowStockItems !== 1 ? 's' : ''} in low stock
              </p>
              <p className="text-xs text-amber-600">
                Items are below their minimum stock level
              </p>
            </div>
          </div>
          <button className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
            View All <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaClock className="text-amber-500" />
              Pending Approvals
            </h3>
            {pendingApprovals.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {pendingApprovals.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                All caught up! No pending approvals.
              </div>
            ) : (
              pendingApprovals.slice(0, 5).map((request) => (
                <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <FaUser className="text-xs" />
                        {request.requestedBy?.fullName || 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/user/pending-approval-detail/${request._id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <FaEye className="text-xs" />
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
            {pendingApprovals.length > 5 && (
              <div className="px-4 py-2 text-center">
                <button
                  onClick={() => navigate('/user/pending-approvals')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View all {pendingApprovals.length} pending approvals
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Recent Activity
            </h3>
            <button
              onClick={() => navigate('/user/department-requests')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentRequests.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No recent activity</div>
            ) : (
              recentRequests.map((request) => (
                <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <FaUser className="text-xs" />
                        {request.requestedBy?.fullName || 'Unknown'} • {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
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
          onClick={() => navigate('/user/create-stock-request')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaFileInvoice className="text-blue-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">New Request</p>
        </button>
        <button
          onClick={() => navigate('/user/pending-approvals')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaClock className="text-amber-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Pending Approvals</p>
        </button>
        <button
          onClick={() => navigate('/user/department-requests')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaBuilding className="text-purple-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">All Requests</p>
        </button>
        <button
          onClick={() => navigate('/user/department-report')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaFileInvoice className="text-green-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Report</p>
        </button>
      </div>
    </div>
  );
};

export default DepartmentDashboard;