// pages/PendingApprovals.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaUser,
  FaBoxes,
  FaCalendarAlt,
  FaBuilding,
  FaExclamationCircle,
  FaEye,
  FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const PendingApprovals = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({ show: false, requestId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/stock-requests/pending-approvals');
      if (response.data.success) {
        setRequests(response.data.requests);
        setDepartment(response.data.department);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.requestNumber?.toLowerCase().includes(searchLower) ||
      request.requestedBy?.fullName?.toLowerCase().includes(searchLower) ||
      request.requestedItems?.some(item => 
        item.item?.name?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Handle approve
  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      const response = await axiosInstance.put(`/api/stock-requests/approve/${requestId}`);
      if (response.data.success) {
        toast.success('Request approved successfully!');
        // Remove from list
        setRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectModal.requestId) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(rejectModal.requestId);
    try {
      const response = await axiosInstance.put(
        `/api/stock-requests/reject/${rejectModal.requestId}`,
        { rejectionReason: rejectionReason.trim() }
      );
      if (response.data.success) {
        toast.success('Request rejected successfully');
        setRequests(prev => prev.filter(r => r._id !== rejectModal.requestId));
        setRejectModal({ show: false, requestId: null });
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading pending approvals...</p>
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
              <FaClock className="text-amber-500" />
              Pending Approvals
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve stock requests from your department
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Pending</p>
                <p className="text-2xl font-bold text-amber-600">{requests.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FaClock className="text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Items Requested</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.reduce((sum, r) => 
                    sum + r.requestedItems.reduce((s, item) => s + item.quantity, 0), 0
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FaBoxes className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Requesters</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(requests.map(r => r.requestedBy?._id)).size}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FaUser className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by request number, requester, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          {searchTerm && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <FaTimes size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          {requests.length === 0 ? (
            <>
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">
                No pending requests in your department.
              </p>
            </>
          ) : (
            <>
              <FaExclamationCircle className="text-4xl text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
              <p className="text-slate-600">
                Try adjusting your search term.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">
                    {request.requestNumber}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    <FaClock className="mr-1" />
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <FaUser className="text-xs" />
                    {request.requestedBy?.fullName || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-xs" />
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FaBoxes className="text-blue-500" />
                    Requested Items
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {request.requestedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-200"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {item.item?.name || 'Unknown'}
                        </span>
                        <span className="text-sm text-slate-500">
                          ×{item.quantity} {item.item?.unit || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remarks */}
                {request.remarks && (
                  <div className="mb-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="font-medium text-slate-700">Remarks:</span> {request.remarks}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => navigate(`/user/pending-approval-detail/${request._id}`)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaEye />
                    View Details
                  </button>
                  <button
                    onClick={() => handleApprove(request._id)}
                    disabled={actionLoading === request._id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === request._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheckCircle />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal({ show: true, requestId: request._id })}
                    disabled={actionLoading === request._id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaTimesCircle />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Reject Request</h3>
              <p className="text-slate-600 mb-4">
                Please provide a reason for rejecting this request.
              </p>
              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setRejectModal({ show: false, requestId: null });
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === rejectModal.requestId}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === rejectModal.requestId ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTimesCircle />
                  )}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;