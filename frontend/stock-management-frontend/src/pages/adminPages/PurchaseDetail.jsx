import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationCircle,
  FaFileInvoice,
  FaCalendarAlt,
  FaBoxes,
  FaTruck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaExchangeAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const PurchaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [purchase, setPurchase] = useState(null);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/purchases/get-purchase/${id}`);
      if (response.data.success) {
        setPurchase(response.data.purchase);
        setStockTransactions(response.data.stockTransactions || []);
        setStats(response.data.stats || { totalItems: 0, totalQuantity: 0 });
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      if (error.response?.status === 404) {
        setError('Purchase not found');
      } else {
        setError('Failed to load purchase details');
      }
      toast.error('Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete (will be implemented later)
  const handleDeletePurchase = async () => {
    toast.info('Delete functionality coming soon');
    setShowDeleteModal(false);
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

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toFixed(2) || '0.00';
  };

  // Get status badge (for supplier active status)
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  };

  // Get transaction type badge
  const getTransactionBadge = (type) => {
    const colors = {
      'Stock In': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Stock Out': 'bg-amber-100 text-amber-700 border-amber-200',
      'Adjustment': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <FaExclamationCircle className="text-rose-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Purchase Not Found</h3>
          <p className="text-slate-600 mb-6">{error || 'The purchase you are looking for does not exist'}</p>
          <button
            onClick={() => navigate('/admin/purchase-list')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Purchase List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm sm:text-base self-start"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Purchase List
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200">
              <FaFileInvoice className="mr-1" /> {purchase.invoiceNumber}
            </span>
            <button
              onClick={() => navigate(`/admin/edit-purchase/${purchase._id}`)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-2"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-2"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Purchase Details</h1>
          <p className="text-sm sm:text-base text-slate-600">Complete information about this purchase order</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section 1: Purchase Details - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Purchase Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FaFileInvoice /> Purchase Details
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Invoice Number</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">{purchase.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Purchase Date</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1 flex items-center gap-2">
                      <FaCalendarAlt className="text-slate-400 text-sm" />
                      {formatDate(purchase.purchaseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(purchase.totalAmount)} ETB</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Items</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1 flex items-center gap-2">
                      <FaBoxes className="text-slate-400" />
                      {stats.totalItems} items ({stats.totalQuantity} units)
                    </p>
                  </div>
                </div>
                {purchase.remarks && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Remarks</p>
                    <p className="text-sm sm:text-base text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {purchase.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-purple-600">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FaTruck /> Supplier Information
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {purchase.supplier ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Company Name</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">{purchase.supplier.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Contact Person</p>
                      <p className="text-base text-slate-800 mt-1 flex items-center gap-2">
                        <FaUser className="text-slate-400 text-sm" />
                        {purchase.supplier.contactPerson || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</p>
                      <p className="text-base text-slate-800 mt-1 flex items-center gap-2">
                        <FaEnvelope className="text-slate-400 text-sm" />
                        {purchase.supplier.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone</p>
                      <p className="text-base text-slate-800 mt-1 flex items-center gap-2">
                        <FaPhone className="text-slate-400 text-sm" />
                        {purchase.supplier.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Address</p>
                      <p className="text-base text-slate-800 mt-1 flex items-start gap-2">
                        <FaMapMarkerAlt className="text-slate-400 text-sm mt-1" />
                        {purchase.supplier.address || 'N/A'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(purchase.supplier.isActive)} mt-1`}>
                        {purchase.supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No supplier information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Creator Info + Stock Transactions Summary (spans 1 column) */}
          <div className="space-y-6">
            {/* Creator Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FaUser /> Creator
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {purchase.createdBy ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Name</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">{purchase.createdBy.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</p>
                      <p className="text-base text-slate-800 mt-1 flex items-center gap-2">
                        <FaEnvelope className="text-slate-400 text-sm" />
                        {purchase.createdBy.email}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Created At</p>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <FaClock className="text-slate-400 text-sm" />
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Last Updated</p>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <FaClock className="text-slate-400 text-sm" />
                        {formatDate(purchase.updatedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No creator information available</p>
                )}
              </div>
            </div>

            {/* Stock Transactions Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FaExchangeAlt /> Stock Transactions
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600">Total Transactions</p>
                  <p className="text-lg font-bold text-slate-800">{stockTransactions.length}</p>
                </div>
                {stockTransactions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {stockTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {transaction.item?.name || 'Unknown Item'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(transaction.transactionDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTransactionBadge(transaction.transactionType)}`}>
                            {transaction.transactionType}
                          </span>
                          <span className="font-bold text-emerald-600">+{transaction.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {stockTransactions.length > 5 && (
                      <p className="text-xs text-slate-400 text-center pt-1">
                        + {stockTransactions.length - 5} more transactions
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No stock transactions found</p>
                )}
                <button
                  onClick={() => navigate(`/admin/stock-transaction-by-purchase/${purchase._id}`)}
                  className="w-full mt-3 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View All Transactions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Purchased Items - Full Width */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-linear-to-r from-emerald-500 to-emerald-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <FaBoxes /> Purchased Items
            </h2>
            <span className="text-xs text-white/80">
              {stats.totalItems} items • {stats.totalQuantity} units total
            </span>
          </div>
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-center py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                  <th className="text-right py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchase.purchasedItems?.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-sm text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {item.item?.code || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-sm font-medium text-slate-800">{item.item?.name || 'Unknown Item'}</span>
                      <span className="text-xs text-slate-400 ml-1">({item.item?.unit || 'N/A'})</span>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{item.item?.category?.name || 'N/A'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-medium text-slate-700">{item.quantity}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-sm text-slate-600">{formatCurrency(item.unitPrice)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-sm font-semibold text-emerald-600">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan="6" className="py-3 px-3 text-right">
                    <span className="text-sm font-semibold text-slate-700">Grand Total</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(purchase.totalAmount)} ETB</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Purchase ID: {purchase._id}</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-rose-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Delete Purchase</h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete invoice <strong>{purchase.invoiceNumber}</strong>?
              </p>
              <p className="text-sm text-rose-500 mb-6">
                ⚠️ This will reverse all stock quantities and remove associated transactions.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePurchase}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {actionLoading ? (
                    <><FaSpinner className="animate-spin" /> Deleting...</>
                  ) : (
                    <><FaTrash /> Delete</>
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

export default PurchaseDetail;