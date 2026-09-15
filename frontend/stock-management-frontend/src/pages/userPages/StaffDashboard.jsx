// pages/StaffDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaClock,
  FaBoxes,
  FaUser,
  FaArrowRight,
  FaPlus,
  FaList,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    issued: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Fetch all requests (or use the same endpoint as Department Dashboard)
      const response = await axiosInstance.get('/api/dashboard/staff-dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentRequests(response.data.recentRequests);
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome Back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's an overview of your stock requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-green-500 font-medium uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Issued</p>
          <p className="text-2xl font-bold text-blue-600">{stats.issued || 0}</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Recent Requests
          </h3>
          <button
            onClick={() => navigate('/user/my-requests')}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <FaArrowRight className="text-xs" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentRequests.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No recent requests
            </div>
          ) : (
            recentRequests.map((request) => (
              <div key={request._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FaBoxes className="text-xs" />
                      {request.requestedItems?.length || 0} items • {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    <button
                      onClick={() => navigate(`/user/request-detail/${request._id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/user/create-stock-request')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaPlus className="text-blue-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">New Request</p>
        </button>
        <button
          onClick={() => navigate('/user/items')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaBoxes className="text-green-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">Available Items</p>
        </button>
        <button
          onClick={() => navigate('/user/my-requests')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaList className="text-purple-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">My Requests</p>
        </button>
        <button
          onClick={() => navigate('/user/profile')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaUser className="text-amber-600 text-2xl mx-auto mb-1" />
          <p className="text-xs font-medium text-slate-700">My Profile</p>
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard;