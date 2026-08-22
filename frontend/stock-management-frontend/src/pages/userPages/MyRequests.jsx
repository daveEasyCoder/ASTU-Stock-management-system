import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaList,
  FaSpinner,
  FaExclamationCircle,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/stock-requests/my-requests');
      if (response.data.success) {
        setRequests(response.data.requests);
        setTotalPages(Math.ceil(response.data.requests.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      req.requestNumber?.toLowerCase().includes(searchLower) ||
      req.requestedItems?.some(item =>
        item.item?.name?.toLowerCase().includes(searchLower) ||
        item.item?.code?.toLowerCase().includes(searchLower)
      );
    const matchesStatus = filterStatus === 'all' ? true : req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalFiltered = filteredRequests.length;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginate = (page) => setCurrentPage(page);

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: FaClock },
      'Approved': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FaCheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-700 border-red-200', icon: FaTimes },
      'Issued': { color: 'bg-green-100 text-green-700 border-green-200', icon: FaCheckCircle },
    };
    return config[status] || config['Pending'];
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

  // Get total quantity
  const getTotalQuantity = (items) => {
    return items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  // Get item names
  const getItemNames = (items) => {
    return items?.map(item => item.item?.name || 'Unknown').join(', ') || '';
  };

  // Handle cancel request (optional)
  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      
      await axiosInstance.put(`/api/stock-requests/cancel-my-request/${selectedRequest._id}`);
      toast.success('Request cancelled successfully');
      fetchRequests();
      setShowCancelModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaList className="text-blue-600" />
              My Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all your stock requests and their status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {requests.length} Total Requests
            </span>
            <button
              onClick={() => navigate('/user/create-stock-request')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/25"
            >
              + New Request
            </button>
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
              placeholder="Search by request number or item name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Issued">Issued</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationCircle className="text-4xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No requests found</h3>
          <p className="text-slate-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'You have not created any stock requests yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => navigate('/user/create-stock-request')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              + Create Your First Request
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Request #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRequests.map((req) => {
                    const status = getStatusBadge(req.status);
                    const StatusIcon = status.icon;
                    const totalQty = getTotalQuantity(req.requestedItems);
                    const itemNames = getItemNames(req.requestedItems);
                    const canCancel = req.status === 'Pending';

                    return (
                      <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{req.requestNumber}</p>
                            <p className="text-xs text-slate-400 sm:hidden">{itemNames.slice(0, 30)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <p className="text-sm text-slate-600 truncate max-w-[150px]" title={itemNames}>
                            {itemNames || 'N/A'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-slate-700">{totalQty}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600">{req.department?.name || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                            <StatusIcon className="mr-1 text-xs" />
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-slate-500">{formatDate(req.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/user/request-detail/${req._id}`)}
                              className="p-1.5 text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye size={15} />
                            </button>
                            {canCancel && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowCancelModal(true);
                                }}
                                className="p-1.5 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel Request"
                              >
                                <FaTrash size={15} />
                              </button>
                            )}
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
          {totalFiltered > itemsPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalFiltered)} of {totalFiltered} requests
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => paginate(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft size={12} />
                </button>
                {[...Array(Math.ceil(totalFiltered / itemsPerPage))].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === Math.ceil(totalFiltered / itemsPerPage) ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() => paginate(page)}
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
                  onClick={() => paginate(Math.min(currentPage + 1, Math.ceil(totalFiltered / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(totalFiltered / itemsPerPage)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Cancel Request</h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to cancel request <strong>{selectedRequest.requestNumber}</strong>?
              </p>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. The request will be removed from the approval queue.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Keep Request
                </button>
                <button
                  onClick={handleCancelRequest}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {actionLoading ? (
                    <><FaSpinner className="animate-spin" /> Cancelling...</>
                  ) : (
                    <>Yes, Cancel</>
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

export default MyRequests;