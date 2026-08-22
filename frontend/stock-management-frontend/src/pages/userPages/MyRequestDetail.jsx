// pages/MyRequestDetail.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBoxes,
  FaUser,
  FaCalendarAlt,
  FaBuilding,
  FaFileInvoice,
  FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const RequestDetail = ({ showCancelBtn = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/stock-requests/request-detail/${id}`);
      if (response.data.success) {
        setRequest(response.data.request);
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      if (error.response?.status === 404) {
        setError('Request not found');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this request');
      } else {
        setError('Failed to load request details');
      }
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await axiosInstance.put(`/api/stock-requests/cancel-my-request/${id}`);
      if (response.data.success) {
        toast.success('Request cancelled successfully');
        // Update the request status
         navigate("/user/my-requests")
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaTimesCircle },
    };
    const info = statusMap[status] || statusMap['Pending'];
    const Icon = info.icon;
    return { bg: info.bg, text: info.text, icon: Icon };
  };

  // Get item availability status
  const getItemStatus = (requestedQty, availableQty) => {
    if (availableQty === 0) return { label: 'Out of Stock', color: 'text-red-500' };
    if (requestedQty <= availableQty) return { label: 'Available', color: 'text-green-500' };
    return { label: 'Insufficient', color: 'text-amber-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm mb-6"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Requests
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationCircle className="text-5xl text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Not Found</h3>
          <p className="text-slate-600 mb-6">{error || 'The request you are looking for does not exist'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(request.status);
  const StatusIcon = statusInfo.icon;
  const canCancel = request.status === 'Pending' && showCancelBtn;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to  Requests
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Request Details
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {request.requestNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
              <StatusIcon className="mr-1.5" />
              {request.status}
            </span>
            {canCancel && (
              <button
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {cancelling ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Request Info Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-white font-semibold">Request Information</h2>
              <p className="text-blue-100 text-sm">Submitted on {formatDate(request.createdAt)}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
              <StatusIcon className="mr-1.5" />
              {request.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Request Number</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{request.requestNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date Submitted</p>
              <p className="text-sm text-slate-700 mt-1 flex items-center gap-1">
                <FaCalendarAlt className="text-slate-400 text-xs" />
                {formatDate(request.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Requested By</p>
              <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-1">
                <FaUser className="text-slate-400 text-xs" />
                {request.requestedBy?.fullName || 'Unknown'}
              </p>
              <p className="text-xs text-slate-400">{request.requestedBy?.email || ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Department</p>
              <p className="text-sm text-slate-700 mt-1 flex items-center gap-1">
                <FaBuilding className="text-slate-400 text-xs" />
                {request.department?.name || 'Not Assigned'}
                {request.department?.code && (
                  <span className="text-xs text-slate-400">({request.department.code})</span>
                )}
              </p>
            </div>
          </div>

          {/* Approval Flow */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Approval Flow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1: Request */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-blue-600 text-sm" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step 1</p>
                  <p className="text-sm font-medium text-slate-800">Requested</p>
                  <p className="text-xs text-slate-400">{formatDate(request.createdAt)}</p>
                  <p className="text-xs text-slate-600">{request.requestedBy?.fullName}</p>
                </div>
              </div>

              {/* Step 2: Approval */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
                  {request.status === 'Approved' || request.status === 'Issued' ? (
                    <FaCheckCircle className="text-emerald-600 text-sm" />
                  ) : request.status === 'Rejected' ? (
                    <FaTimesCircle className="text-red-600 text-sm" />
                  ) : (
                    <FaClock className="text-amber-600 text-sm" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step 2</p>
                  <p className="text-sm font-medium text-slate-800">
                    {request.status === 'Approved' ? 'Approved' :
                     request.status === 'Rejected' ? 'Rejected' :
                     request.status === 'Issued' ? 'Approved' : 'Pending Approval'}
                  </p>
                  {request.approvedBy && (
                    <>
                      <p className="text-xs text-slate-400">{formatDate(request.approvedDate)}</p>
                      <p className="text-xs text-slate-600">By: {request.approvedBy?.fullName}</p>
                    </>
                  )}
                  {request.status === 'Pending' && (
                    <p className="text-xs text-amber-600">Waiting for Department Head</p>
                  )}
                  {request.status === 'Rejected' && request.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {request.rejectionReason}</p>
                  )}
                </div>
              </div>

              {/* Step 3: Issuance */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                  {request.status === 'Issued' ? (
                    <FaCheckCircle className="text-blue-600 text-sm" />
                  ) : (
                    <FaClock className="text-slate-400 text-sm" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step 3</p>
                  <p className="text-sm font-medium text-slate-800">
                    {request.status === 'Issued' ? 'Issued' : 'Pending Issuance'}
                  </p>
                  {request.issuedBy && (
                    <>
                      <p className="text-xs text-slate-400">{formatDate(request.issuedDate)}</p>
                      <p className="text-xs text-slate-600">By: {request.issuedBy?.fullName}</p>
                    </>
                  )}
                  {request.status === 'Approved' && (
                    <p className="text-xs text-blue-600">Waiting for Store Manager</p>
                  )}
                  {request.status === 'Pending' && (
                    <p className="text-xs text-slate-400">Will be issued after approval</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requested Items */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <FaBoxes className="text-blue-500" />
              Requested Items
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Code</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Available</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.requestedItems.map((item, index) => {
                    const itemData = item.item;
                    const availableQty = itemData?.quantity || 0;
                    const status = getItemStatus(item.quantity, availableQty);
                    
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-sm text-slate-500">{index + 1}</td>
                        <td className="py-2 px-3">
                          <p className="text-sm font-medium text-slate-800">{itemData?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-slate-400">{itemData?.unit || 'N/A'}</p>
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {itemData?.code || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-sm font-semibold text-slate-700">{item.quantity}</span>
                        </td>
                        <td className="py-2 px-3 text-center hidden sm:table-cell">
                          <span className="text-sm text-slate-600">{availableQty}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          {request.remarks && (
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Remarks</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-sm text-slate-700">{request.remarks}</p>
              </div>
            </div>
          )}

          {/* Cancellation Info (if cancelled) */}
          {request.status === 'Cancelled' && (
            <div className="border-t border-slate-200 pt-4">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  This request was cancelled by the requester.
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Cancelled on: {formatDate(request.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center text-xs text-slate-400">
        <p>Request ID: {request._id}</p>
      </div>
    </div>
  );
};

export default RequestDetail;