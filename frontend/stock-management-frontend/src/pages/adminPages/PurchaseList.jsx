// pages/PurchaseList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingCart,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaFileInvoice,
  FaTruck,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaBoxes,
  FaMoneyBillWave,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const PurchaseList = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  
  const [allPurchases, setAllPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [suppliers, setSuppliers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch purchases and suppliers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch purchases
        const purchaseRes = await axios.get(`${BASIC_URL}/api/purchases/get-purchases`);
        if (purchaseRes.data.success) {
          setAllPurchases(purchaseRes.data.purchases);
        }

        // Fetch suppliers for filter dropdown
        const supplierRes = await axios.get(`${BASIC_URL}/api/suppliers/get-suppliers`);
        if (supplierRes.data.success) {
          setSuppliers(supplierRes.data.suppliers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load purchases');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASIC_URL]);

  // --- Client-side filtering ---
  const filteredPurchases = useMemo(() => {
    return allPurchases.filter(purchase => {
      // Search by invoice number or supplier name
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        purchase.invoiceNumber?.toLowerCase().includes(searchLower) ||
        purchase.supplier?.companyName?.toLowerCase().includes(searchLower);

      // Filter by supplier
      const matchesSupplier = filterSupplier ? purchase.supplier?._id === filterSupplier : true;

      // Filter by date range
      const purchaseDate = new Date(purchase.purchaseDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      let matchesDate = true;
      if (start) {
        start.setHours(0,0,0,0);
        matchesDate = matchesDate && purchaseDate >= start;
      }
      if (end) {
        end.setHours(23,59,59,999);
        matchesDate = matchesDate && purchaseDate <= end;
      }

      return matchesSearch && matchesSupplier && matchesDate;
    });
  }, [allPurchases, searchTerm, filterSupplier, startDate, endDate]);

  // Pagination (client-side)
  const totalItems = filteredPurchases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  // Stats
  const stats = useMemo(() => {
    const totalAmount = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalQuantity = filteredPurchases.reduce((sum, p) => {
      const qty = p.purchasedItems?.reduce((s, item) => s + (item.quantity || 0), 0) || 0;
      return sum + qty;
    }, 0);
    return { totalAmount, totalQuantity, totalPurchases: filteredPurchases.length };
  }, [filteredPurchases]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterSupplier('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Purchase Management</h1>
              <p className="mt-1 text-slate-600">
                Manage all purchase orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaShoppingCart className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Total: {totalItems}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/create-purchase')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <FaPlus />
                Add Purchase
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Purchases</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalPurchases}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaFileInvoice className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)} ETB</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FaMoneyBillWave className="text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Items Purchased</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalQuantity}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaBoxes className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by invoice or supplier..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FaFilter className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filters</span>
                {(filterSupplier || startDate || endDate) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              {(searchTerm || filterSupplier || startDate || endDate) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <select
                    value={filterSupplier}
                    onChange={(e) => {
                      setFilterSupplier(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map(sup => (
                      <option key={sup._id} value={sup._id}>
                        {sup.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaExclamationCircle className="text-4xl text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No purchases found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterSupplier || startDate || endDate
                ? 'Try adjusting your search or filters'
                : 'No purchases have been recorded yet'}
            </p>
            <button
              onClick={() => navigate('/admin/create-purchase')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create First Purchase
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Supplier</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPurchases.map((purchase) => {
                      const itemCount = purchase.purchasedItems?.length || 0;
                      return (
                        <tr key={purchase._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FaFileInvoice className="text-slate-400 text-sm" />
                              <span className="text-sm font-medium text-slate-800">{purchase.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-sm text-slate-700">{purchase.supplier?.companyName || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-600">{formatDate(purchase.purchaseDate)}</span>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-sm text-slate-600">{itemCount}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(purchase.totalAmount)} ETB</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/purchase-detail/${purchase._id}`)}
                                className="p-1.5 text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye size={16} />
                              </button>
                  
                              {/* <button
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash size={16} />
                              </button> */}
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
                  Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} of {totalItems} purchases
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    // Show limited page numbers with ellipsis
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
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal (placeholder) */}
      {showDeleteModal && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-rose-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Delete Purchase</h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete invoice <strong>{selectedPurchase.invoiceNumber}</strong>?
              </p>
              <p className="text-sm text-rose-500 mb-6">
                ⚠️ This will reverse stock quantities and remove transactions.
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

export default PurchaseList;