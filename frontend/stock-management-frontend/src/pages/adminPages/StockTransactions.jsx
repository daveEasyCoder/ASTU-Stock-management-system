// pages/StoreManager/StockTransactions.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaExclamationCircle,
  FaBoxes,
  FaEye,
  FaDownload,
  FaFilter,
  FaTimes,
  FaArrowRight,
  FaInfoCircle,
  FaShoppingCart,
  FaClipboardList,
  FaAdjust,
  FaSearch,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';
import axios from 'axios';

const StockTransactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters (frontend only)
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    startDate: '',
    endDate: '',
    item: 'all',
    department: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchItems();
    fetchDepartments();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/stock-transactions/all');
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get('/api/items/get-items');
      if (response.data.success) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
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
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filters.type !== 'all' && tx.transactionType !== filters.type) {
        return false;
      }

      // Item filter
      if (filters.item !== 'all' && tx.item?._id !== filters.item) {
        return false;
      }

      // Department filter
      if (filters.department !== 'all') {
        if (tx.department?._id !== filters.department) {
          return false;
        }
      }

      // Search filter (item name, reference number)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesItem = tx.item?.name?.toLowerCase().includes(searchLower);
        const matchesRef = tx.referenceNumber?.toLowerCase().includes(searchLower);
        const matchesReason = tx.reason?.toLowerCase().includes(searchLower);
        if (!matchesItem && !matchesRef && !matchesReason) {
          return false;
        }
      }

      // Date range filter
      const txDate = new Date(tx.transactionDate);
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // --- STATISTICS ---
  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalIn = filteredTransactions
      .filter(tx => tx.transactionType === 'Stock In')
      .reduce((sum, tx) => sum + tx.quantity, 0);
    const totalOut = filteredTransactions
      .filter(tx => tx.transactionType === 'Stock Out')
      .reduce((sum, tx) => sum + tx.quantity, 0);
    const totalAdjustment = filteredTransactions
      .filter(tx => tx.transactionType === 'Adjustment')
      .reduce((sum, tx) => sum + tx.quantity, 0);

    return { total, totalIn, totalOut, totalAdjustment };
  }, [filteredTransactions]);

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: 'all',
      search: '',
      startDate: '',
      endDate: '',
      item: 'all',
      department: 'all',
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction type badge
  const getTypeBadge = (type) => {
    const typeMap = {
      'Stock In': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: FaShoppingCart },
      'Stock Out': { bg: 'bg-amber-100', text: 'text-amber-700', icon: FaClipboardList },
      'Adjustment': { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaAdjust },
    };
    const info = typeMap[type] || typeMap['Stock In'];
    const Icon = info.icon;
    return { bg: info.bg, text: info.text, icon: Icon };
  };

  // Get reference link
  const getReferenceLink = (transaction) => {
    if (transaction.purchase) {
      return {
        label: `Purchase ${transaction.purchase.invoiceNumber}`,
        path: `/admin/purchase-detail/${transaction.purchase._id}`,
      };
    }
    if (transaction.stockRequest) {
      return {
        label: `Request ${transaction.stockRequest.requestNumber}`,
        path: `/admin/requests-detail/${transaction.stockRequest._id}`,
      };
    }
    return null;
  };

  // Handle export (CSV)
  const handleExport = () => {
    const headers = ['Item', 'Type', 'Quantity', 'Unit Price', 'Date', 'Reference', 'Reason', 'Performed By'];
    const rows = filteredTransactions.map(tx => [
      tx.item?.name || 'N/A',
      tx.transactionType,
      tx.quantity,
      tx.unitPrice || 0,
      formatDate(tx.transactionDate),
      tx.referenceNumber || 'N/A',
      tx.reason || 'N/A',
      tx.performedBy?.fullName || 'System',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully!');
  };

  // Handle view detail
  const handleViewDetail = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/stock-transactions/get/${id}`);
      if (response.data.success) {
        setSelectedTransaction(response.data.transaction);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      toast.error('Failed to load transaction details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading transactions...</p>
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
              <FaBoxes className="text-blue-600" />
              Stock Transactions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete history of all stock movements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
            >
              <FaArrowRight className="text-xs" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">Stock In</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.totalIn}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Stock Out</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalOut}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <p className="text-xs text-purple-500 font-medium uppercase tracking-wider">Adjustments</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalAdjustment}</p>
        </div>
      </div>

      {/* Net Change */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
          (stats.totalIn - stats.totalOut + stats.totalAdjustment) >= 0
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }`}>
          <FaInfoCircle className="mr-2" />
          Net Change: {(stats.totalIn - stats.totalOut + stats.totalAdjustment).toFixed(0)} units
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
              placeholder="Search by item, reference, or reason..."
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
              {(filters.type !== 'all' || filters.item !== 'all' || filters.department !== 'all' || filters.startDate || filters.endDate) && (
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
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, type: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item</label>
              <select
                value={filters.item}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, item: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Items</option>
                {items.filter(i => i.isActive).map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </div>
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
            <div className="grid grid-cols-2 gap-2">
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
          </div>
        )}
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationCircle className="text-4xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions found</h3>
          <p className="text-slate-600">
            {filters.search || filters.type !== 'all' || filters.item !== 'all' || filters.department !== 'all' || filters.startDate || filters.endDate
              ? 'Try adjusting your search or filters'
              : 'No stock transactions have been recorded yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Reference</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Performed By</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((tx, index) => {
                    const typeInfo = getTypeBadge(tx.transactionType);
                    const TypeIcon = typeInfo.icon;
                    const ref = getReferenceLink(tx);

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-800">{tx.item?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400">{tx.item?.code || ''}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
                            <TypeIcon className="mr-1" />
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-bold ${
                            tx.transactionType === 'Stock In' ? 'text-emerald-600' :
                            tx.transactionType === 'Stock Out' ? 'text-amber-600' :
                            'text-purple-600'
                          }`}>
                            {tx.transactionType === 'Stock In' ? '+' : ''}{tx.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {ref ? (
                            <button
                              onClick={() => navigate(ref.path)}
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {ref.label}
                            </button>
                          ) : (
                            <span className="text-sm text-slate-400">{tx.referenceNumber || '—'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-slate-600">{tx.performedBy?.fullName || 'System'}</span>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-sm text-slate-500">{formatDate(tx.transactionDate)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewDetail(tx._id)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
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
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      {/* Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Transaction Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Transaction ID</p>
                    <p className="text-sm font-medium text-slate-800">{selectedTransaction._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTransaction.transactionType === 'Stock In' ? 'bg-emerald-100 text-emerald-700' :
                      selectedTransaction.transactionType === 'Stock Out' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {selectedTransaction.transactionType}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Item</p>
                    <p className="text-sm font-medium text-slate-800">{selectedTransaction.item?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{selectedTransaction.item?.code || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Quantity</p>
                    <p className={`text-sm font-bold ${
                      selectedTransaction.transactionType === 'Stock In' ? 'text-emerald-600' :
                      selectedTransaction.transactionType === 'Stock Out' ? 'text-amber-600' :
                      'text-purple-600'
                    }`}>
                      {selectedTransaction.transactionType === 'Stock In' ? '+' : ''}{selectedTransaction.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Unit Price</p>
                    <p className="text-sm font-medium text-slate-800">{selectedTransaction.unitPrice || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm text-slate-700">{formatDate(selectedTransaction.transactionDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Performed By</p>
                    <p className="text-sm text-slate-700">{selectedTransaction.performedBy?.fullName || 'System'}</p>
                  </div>
                  {selectedTransaction.department && (
                    <div>
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="text-sm text-slate-700">{selectedTransaction.department.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference Info */}
              {(selectedTransaction.purchase || selectedTransaction.stockRequest) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reference</p>
                  {selectedTransaction.purchase && (
                    <p className="text-sm text-blue-700">
                      Purchase: {selectedTransaction.purchase.invoiceNumber}
                    </p>
                  )}
                  {selectedTransaction.stockRequest && (
                    <p className="text-sm text-blue-700">
                      Request: {selectedTransaction.stockRequest.requestNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              {selectedTransaction.reason && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reason</p>
                  <p className="text-sm text-slate-700">{selectedTransaction.reason}</p>
                </div>
              )}

              {/* Supplier */}
              {selectedTransaction.supplier && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Supplier</p>
                  <p className="text-sm text-slate-700">{selectedTransaction.supplier.companyName}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-sm text-slate-700">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm text-slate-700">{formatDate(selectedTransaction.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  if (selectedTransaction.item) {
                    navigate(`/admin/item-detail/${selectedTransaction.item._id}`);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                View Item
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransactions;