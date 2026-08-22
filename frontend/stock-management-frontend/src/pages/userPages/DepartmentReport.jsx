// pages/DepartmentReport.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaSpinner,
  FaExclamationCircle,
  FaFileInvoice,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaFilter,
  FaTimes,
  FaArrowLeft,
  FaChartBar,
  FaUsers,
  FaTrophy,
  FaEye,
  FaSearch,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const DepartmentReport = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]);
  const [department, setDepartment] = useState(null);
  const [staff, setStaff] = useState([]);
  const [items, setItems] = useState([]);
  
  // Filters (frontend only)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    staffFilter: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/reports/department-reports');
      if (response.data.success) {
        setAllRequests(response.data.requests);
        setDepartment(response.data.department);
        setStaff(response.data.staff);
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // --- FRONTEND FILTERING ---
  const filteredRequests = useMemo(() => {
    return allRequests.filter(request => {
      // Status filter
      if (filters.status !== 'all' && request.status !== filters.status) {
        return false;
      }

      // Search filter (by request number or requester name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesNumber = request.requestNumber?.toLowerCase().includes(searchLower);
        const matchesRequester = request.requestedBy?.fullName?.toLowerCase().includes(searchLower);
        if (!matchesNumber && !matchesRequester) {
          return false;
        }
      }

      // Staff filter
      if (filters.staffFilter !== 'all') {
        if (request.requestedBy?._id !== filters.staffFilter) {
          return false;
        }
      }

      // Date range filter
      const requestDate = new Date(request.createdAt);
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (requestDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (requestDate > end) return false;
      }

      return true;
    });
  }, [allRequests, filters]);

  // --- ANALYTICS (from filtered data) ---
  const analytics = useMemo(() => {
    const requests = filteredRequests;
    
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const issued = requests.filter(r => r.status === 'Issued').length;

    // Top items
    const itemStats = {};
    requests.forEach(req => {
      req.requestedItems?.forEach(item => {
        const itemId = item.item?._id;
        if (itemId) {
          if (!itemStats[itemId]) {
            const foundItem = items.find(i => i._id === itemId);
            itemStats[itemId] = {
              name: foundItem?.name || 'Unknown',
              code: foundItem?.code || 'N/A',
              unit: foundItem?.unit || '',
              quantity: 0,
              requests: 0,
            };
          }
          itemStats[itemId].quantity += item.quantity;
          itemStats[itemId].requests += 1;
        }
      });
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Top staff
    const staffStats = {};
    requests.forEach(req => {
      const staffId = req.requestedBy?._id;
      if (staffId) {
        if (!staffStats[staffId]) {
          staffStats[staffId] = {
            name: req.requestedBy?.fullName || 'Unknown',
            email: req.requestedBy?.email || '',
            requests: 0,
            items: 0,
          };
        }
        staffStats[staffId].requests += 1;
        req.requestedItems?.forEach(item => {
          staffStats[staffId].items += item.quantity;
        });
      }
    });

    const topStaff = Object.values(staffStats)
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    // Status distribution
    const statusDistribution = [
      { name: 'Pending', value: pending },
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected },
      { name: 'Issued', value: issued },
    ].filter(s => s.value > 0);

    return {
      total,
      pending,
      approved,
      rejected,
      issued,
      topItems,
      topStaff,
      statusDistribution,
    };
  }, [filteredRequests, items]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: '',
      staffFilter: 'all',
    });
    setShowFilters(false);
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

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <FaClock className="text-amber-600" />,
      'Approved': <FaCheckCircle className="text-green-600" />,
      'Rejected': <FaTimesCircle className="text-red-600" />,
      'Issued': <FaCheckCircle className="text-blue-600" />,
    };
    return icons[status] || <FaClock />;
  };

  // Get bar color
  const getBarColor = (name) => {
    const colors = {
      'Pending': 'bg-amber-500',
      'Approved': 'bg-green-500',
      'Rejected': 'bg-red-500',
      'Issued': 'bg-blue-500',
    };
    return colors[name] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading department report...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <FaExclamationCircle className="text-4xl text-amber-500 mx-auto mb-4" />
        <p className="text-slate-600">No report data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/user')}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm mb-3"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Department Report
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {department.name} ({department.code}) - Complete request overview
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {allRequests.length} total requests
              </span>
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/25">
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Requests</p>
          <p className="text-xl font-bold text-slate-800">{analytics.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Pending</p>
          <p className="text-xl font-bold text-amber-600">{analytics.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-green-500 font-medium uppercase tracking-wider">Approved</p>
          <p className="text-xl font-bold text-green-600">{analytics.approved || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Issued</p>
          <p className="text-xl font-bold text-blue-600">{analytics.issued || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by request number or requester..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FaFilter className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filters</span>
            {(filters.status !== 'all' || filters.staffFilter !== 'all' || filters.startDate || filters.endDate) && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <FaTimes size={12} />
            Reset
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Issued">Issued</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Staff</label>
              <select
                value={filters.staffFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, staffFilter: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Staff</option>
                {staff.map(s => (
                  <option key={s._id} value={s._id}>{s.fullName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Requested Items */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaTrophy className="text-amber-500" />
              Top Requested Items
            </h3>
          </div>
          <div className="p-4">
            {analytics.topItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center">No items requested</p>
            ) : (
              <div className="space-y-3">
                {analytics.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-6">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.code} • {item.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{item.quantity}</p>
                      <p className="text-xs text-slate-400">{item.requests} request{item.requests !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Staff */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaUsers className="text-blue-500" />
              Most Active Staff
            </h3>
          </div>
          <div className="p-4">
            {analytics.topStaff.length === 0 ? (
              <p className="text-sm text-slate-500 text-center">No staff requests</p>
            ) : (
              <div className="space-y-3">
                {analytics.topStaff.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-6">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{staff.name}</p>
                        <p className="text-xs text-slate-400">{staff.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">{staff.requests}</p>
                      <p className="text-xs text-slate-400">{staff.items} items</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      {analytics.statusDistribution.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FaChartBar className="text-blue-500" />
              Status Distribution
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-4">
              {analytics.statusDistribution.map((item, index) => (
                <div key={index} className="flex-1 min-w-[100px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.name)}`}
                      style={{
                        width: `${analytics.total > 0 ? (item.value / analytics.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FaFileInvoice className="text-blue-500" />
            All Requests ({filteredRequests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FaExclamationCircle className="text-4xl mx-auto mb-3 text-slate-300" />
              <p>No requests found matching the filters</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Request</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
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
                      <span className="text-sm text-slate-600">{request.requestedItems?.length || 0} items</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-slate-500">{formatDate(request.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/user/department-request-detail/${request._id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto"
                      >
                        <FaEye className="text-xs" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-slate-400">
        <p>Report generated on {new Date().toLocaleDateString()} • {allRequests.length} total requests</p>
      </div>
    </div>
  );
};

export default DepartmentReport;