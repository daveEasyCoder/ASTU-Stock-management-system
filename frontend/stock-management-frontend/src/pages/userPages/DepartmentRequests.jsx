// pages/DepartmentRequests.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaSearch,
  FaEye,
  FaSpinner,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaTimes,
  FaFileInvoice,
  FaChartBar,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const DepartmentRequests = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDepartmentRequests();
  }, []);

  const fetchDepartmentRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/stock-requests/department-requests');
      if (response.data.success) {
        setRequests(response.data.requests);
        setDepartment(response.data.department);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching department requests:', error);
      toast.error('Failed to load department requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setShowFilters(false);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: FaClock },
      'Approved': { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
      'Issued': { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
    };
    const info = statusMap[status] || statusMap['Pending'];
    const Icon = info.icon;
    return { bg: info.bg, text: info.text, icon: Icon };
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading department requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Department Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of all stock requests from your department
            </p>
          </div>
          {department && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <FaBuilding className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {department.name} ({department.code})
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-700">{stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-xl font-bold text-amber-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Approved</p>
            <p className="text-xl font-bold text-green-600">{stats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Rejected</p>
            <p className="text-xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Issued</p>
            <p className="text-xl font-bold text-blue-600">{stats.issued || 0}</p>
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
              placeholder="Search by request number or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FaFilter className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters</span>
              {filterStatus !== 'all' && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <FaTimes size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              {['all', 'Pending', 'Approved', 'Rejected', 'Issued'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          {requests.length === 0 ? (
            <>
              <FaExclamationCircle className="text-4xl text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">Your department has no stock requests yet.</p>
            </>
          ) : (
            <>
              <FaExclamationCircle className="text-4xl text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
              <p className="text-slate-600">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Request</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Requester</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => {
                  const statusInfo = getStatusBadge(request.status);
                  const StatusIcon = statusInfo.icon;
                  const itemCount = request.requestedItems?.length || 0;
                  const totalQty = request.requestedItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                  return (
                    <tr key={request._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FaFileInvoice className="text-slate-400 text-sm" />
                          <span className="text-sm font-medium text-slate-800">{request.requestNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-700">{request.requestedBy?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{request.requestedBy?.email || ''}</p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <p className="text-sm text-slate-600">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-slate-400">Total: {totalQty} units</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="mr-1" />
                          {request.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-sm text-slate-500">{formatDate(request.createdAt)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => navigate(`/user/department-request-detail/${request._id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <FaEye />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentRequests;