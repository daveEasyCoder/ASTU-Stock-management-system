// pages/StoreManager/Issuance.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaExclamationCircle,
  FaBuilding,
  FaEye,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaTimes,
  FaArrowRight,
  FaCheckDouble,
  FaShoppingBag, 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const Issuance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters (frontend only)
  const [filters, setFilters] = useState({
    department: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [isBulk, setIsBulk] = useState(false);

  useEffect(() => {
    fetchApprovedRequests();
    fetchDepartments();
  }, []);

  const fetchApprovedRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/stock-requests/all-requests');
      if (response.data.success) {
        // Only show APPROVED requests
        const approved = response.data.requests.filter(r => r.status === 'Approved');
        setRequests(approved);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/api/departments/get-departments');
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // --- FRONTEND FILTERING ---
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Department filter
      if (filters.department !== 'all') {
        if (request.department?._id !== filters.department) {
          return false;
        }
      }

      // Search filter (request number or requester name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesNumber = request.requestNumber?.toLowerCase().includes(searchLower);
        const matchesRequester = request.requestedBy?.fullName?.toLowerCase().includes(searchLower);
        if (!matchesNumber && !matchesRequester) {
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
  }, [requests, filters]);

  // --- STATISTICS ---
  const stats = useMemo(() => {
    const total = filteredRequests.length;
    const totalItems = filteredRequests.reduce(
      (sum, r) => sum + (r.requestedItems?.length || 0),
      0
    );
    const totalQty = filteredRequests.reduce(
      (sum, r) => sum + (r.requestedItems?.reduce((s, i) => s + i.quantity, 0) || 0),
      0
    );
    return { total, totalItems, totalQty };
  }, [filteredRequests]);

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      department: 'all',
      search: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
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

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRequests.length === currentItems.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(currentItems.map(r => r._id));
    }
  };

  // Handle select single
  const handleSelect = (id) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter(r => r !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  // Handle single issue
  const handleSingleIssue = (request) => {
    setSelectedRequest(request);
    setIsBulk(false);
    setShowIssueModal(true);
  };

  // Handle bulk issue
  const handleBulkIssue = () => {
    if (selectedRequests.length === 0) {
      toast.warning('Please select at least one request to issue');
      return;
    }
    setIsBulk(true);
    setSelectedRequest(null);
    setShowIssueModal(true);
  };

  // Confirm issue
  const handleConfirmIssue = async () => {
    setIssuing(true);
    try {
      if (isBulk) {
        // Bulk issue - issue each selected request
        const results = [];
        for (const id of selectedRequests) {
          try {
            const response = await axiosInstance.put(`/api/stock-requests/issue-request/${id}`);
            results.push(response.data);
          } catch (err) {
            console.error(`Error issuing request ${id}:`, err);
            // Continue with other requests
          }
        }
        toast.success(`Successfully issued ${results.length} requests!`);
        setSelectedRequests([]);
      } else {
        // Single issue
        const response = await axiosInstance.put(`/api/stock-requests/issue-request/${selectedRequest._id}`);
        if (response.data.success) {
          toast.success(`Request ${selectedRequest.requestNumber} issued successfully!`);
        }
      }
      setShowIssueModal(false);
      setSelectedRequest(null);
      fetchApprovedRequests(); // Refresh the list
    } catch (error) {
      console.error('Error issuing request:', error);
      if (error.response?.data?.insufficientItems) {
        const items = error.response.data.insufficientItems;
        items.forEach(item => {
          toast.error(`${item.name}: Requested ${item.requested}, Available ${item.available}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to issue request');
      }
    } finally {
      setIssuing(false);
    }
  };

  // Get selected request details for bulk modal
  const getSelectedRequestsDetails = () => {
    return requests.filter(r => selectedRequests.includes(r._id));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading approved requests...</p>
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
              <FaShoppingBag className="text-green-600" />
              Issuance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue stock for approved requests across all departments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchApprovedRequests}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
            >
              <FaArrowRight className="text-xs" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ready to Issue</p>
          <p className="text-2xl font-bold text-green-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Items to Issue</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Quantity</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalQty}</p>
        </div>
      </div>

      {/* Search and Filters */}
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
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FaFilter className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters</span>
              {(filters.department !== 'all' || filters.startDate || filters.endDate) && (
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
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, department: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, startDate: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, endDate: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {filteredRequests.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRequests.length === currentItems.length && currentItems.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              Select All
            </label>
            <span className="text-sm text-slate-400">
              ({selectedRequests.length} selected)
            </span>
          </div>
          <button
            onClick={handleBulkIssue}
            disabled={selectedRequests.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              selectedRequests.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FaCheckDouble />
            Bulk Issue ({selectedRequests.length})
          </button>
        </div>
      )}

      {/* Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          {requests.length === 0 ? (
            <>
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No approved requests pending issuance.</p>
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
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === currentItems.length && currentItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Request</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Requester</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Qty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((request) => {
                    const totalQty = request.requestedItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    const isSelected = selectedRequests.includes(request._id);

                    return (
                      <tr key={request._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(request._id)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-800">{request.requestNumber}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <FaBuilding className="mr-1 text-xs" />
                            {request.department?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-700">{request.requestedBy?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{request.requestedBy?.email || ''}</p>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-sm text-slate-600">{request.requestedItems?.length || 0}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600">{totalQty}</span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-slate-500">{formatDate(request.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/requests-detail/${request._id}`)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleSingleIssue(request)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FaCheckCircle size={14} />
                              Issue
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowRight className="rotate-180" size={12} />
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={idx} className="px-1 text-slate-400">…</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isBulk ? `Issue ${selectedRequests.length} Requests` : 'Issue Stock'}
              </h3>
              <p className="text-sm text-slate-500">
                {isBulk
                  ? 'Confirm issuance for all selected requests'
                  : `Confirm issuance for request ${selectedRequest?.requestNumber}`
                }
              </p>
            </div>

            {/* Selected Items Summary for Bulk */}
            {isBulk && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Requests</h4>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {getSelectedRequestsDetails().map((req) => (
                    <li key={req._id} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="font-medium">{req.requestNumber}</span>
                      <span className="text-slate-400">•</span>
                      {req.department?.name}
                      <span className="text-slate-400">•</span>
                      {req.requestedItems?.length || 0} items
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Single Request Details */}
            {!isBulk && selectedRequest && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Request Number</p>
                    <p className="font-medium text-slate-800">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="font-medium text-slate-800">{selectedRequest.department?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Requester</p>
                    <p className="font-medium text-slate-800">{selectedRequest.requestedBy?.fullName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="font-medium text-slate-800">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Items to Issue</h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-600">Item</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Qty</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Available</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedRequest.requestedItems.map((item, idx) => {
                          const itemData = item.item;
                          const available = itemData?.quantity || 0;
                          const isAvailable = available >= item.quantity;
                          return (
                            <tr key={idx} className="bg-white">
                              <td className="py-2 px-3 text-sm">
                                {itemData?.name || 'Unknown'}
                                <span className="text-xs text-slate-400 ml-1">({itemData?.code || 'N/A'})</span>
                              </td>
                              <td className="py-2 px-3 text-center text-sm font-medium">{item.quantity}</td>
                              <td className="py-2 px-3 text-center text-sm">{available}</td>
                              <td className="py-2 px-3 text-center">
                                {isAvailable ? (
                                  <span className="text-xs text-green-600">✅ Available</span>
                                ) : (
                                  <span className="text-xs text-red-600">❌ Insufficient</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmIssue}
                disabled={issuing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {issuing ? (
                  <><FaSpinner className="animate-spin" /> {isBulk ? 'Issuing...' : 'Issuing...'}</>
                ) : (
                  <><FaCheckCircle /> {isBulk ? `Issue ${selectedRequests.length} Requests` : 'Confirm Issue'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issuance;