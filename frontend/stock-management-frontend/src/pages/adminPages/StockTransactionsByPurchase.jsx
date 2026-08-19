import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaSpinner,
  FaExclamationCircle,
  FaExchangeAlt,
  FaBoxes,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaHashtag,
  FaTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const StockTransactionsByPurchase = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStockIn, setTotalStockIn] = useState(0);
  const [purchaseInfo, setPurchaseInfo] = useState(null);

  useEffect(() => {
    window.scrollTo(0,0)
    fetchTransactions();
    fetchPurchaseInfo();
  }, [purchaseId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASIC_URL}/api/stock-transactions/get-stock-transactions-by-purchase/${purchaseId}`
      );
      if (response.data.success) {
        setTransactions(response.data.transactions);
        setTotalStockIn(response.data.totalStockIn);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseInfo = async () => {
    try {
      const response = await axios.get(
        `${BASIC_URL}/api/purchases/get-purchase/${purchaseId}`
      );
      if (response.data.success) {
        setPurchaseInfo(response.data.purchase);
      }
    } catch (err) {
      // Silent fail – it's optional info
      console.warn('Could not fetch purchase info:', err);
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

  // Format currency
  const formatCurrency = (amount) => {
    return (amount || 0).toFixed(2);
  };

  // Get transaction type badge color
  const getTypeBadge = (type) => {
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
          <p className="text-slate-600 text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <FaExclamationCircle className="text-amber-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Transactions Found</h3>
          <p className="text-slate-600 mb-6">
            {error || 'No stock transactions were created for this purchase.'}
          </p>
          <button
            onClick={() => navigate(`/admin/purchase-detail/${purchaseId}`)}
            className="px-4 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Purchase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/admin/purchase-detail/${purchaseId}`)}
            className="flex items-center cursor-pointer text-slate-600 hover:text-blue-600 transition-colors group text-sm sm:text-base"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Purchase
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FaExchangeAlt className="text-blue-600" />
            Stock Transactions
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {purchaseInfo ? `For Purchase: ${purchaseInfo.invoiceNumber}` : ''}
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Total Stock In: {totalStockIn}
            </span>
          </p>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Unit Price</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Performed By</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, index) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{tx.item?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{tx.item?.code || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeBadge(tx.transactionType)}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-semibold ${tx.transactionType === 'Stock In' ? 'text-emerald-600' : tx.transactionType === 'Stock Out' ? 'text-rose-600' : 'text-purple-600'}`}>
                        {tx.transactionType === 'Stock In' ? '+' : ''}{tx.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{formatCurrency(tx.unitPrice)} ETB</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{tx.performedBy?.fullName || 'System'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-500">{formatDate(tx.transactionDate)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <FaInfoCircle className="text-4xl mx-auto mb-3 text-slate-300" />
              <p>No transactions found for this purchase.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Purchase ID: {purchaseId}</p>
        </div>
      </div>
    </div>
  );
};

export default StockTransactionsByPurchase;