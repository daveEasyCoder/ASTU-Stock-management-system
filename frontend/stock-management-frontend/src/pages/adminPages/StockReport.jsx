// pages/adminPages/StockReport.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaBoxes,
  FaWarehouse,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaTimes,
  FaDownload,
  FaPrint,
  FaEye,
  FaChartBar,
  FaArrowRight,
  FaListAlt,
  FaTag,
  FaTruck,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const StockReport = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Filters (frontend only)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    supplier: 'all',
    stockStatus: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchStockReport();
  }, []);

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/reports/stock-reports');
      if (response.data.success) {
        setItems(response.data.items);
        setCategories(response.data.categories || []);
        setSuppliers(response.data.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching stock report:', error);
      toast.error('Failed to load stock report');
    } finally {
      setLoading(false);
    }
  };

  // --- FRONTEND FILTERING ---
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter (name or code)
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(s);
        const matchesCode = item.code?.toLowerCase().includes(s);
        if (!matchesName && !matchesCode) return false;
      }

      // Category filter
      if (filters.category !== 'all') {
        if (item.category?._id !== filters.category) return false;
      }

      // Supplier filter
      if (filters.supplier !== 'all') {
        if (item.supplier?._id !== filters.supplier) return false;
      }

      // Stock status filter
      if (filters.stockStatus !== 'all') {
        const qty = item.quantity || 0;
        const min = item.minimumStockLevel || 0;
        if (filters.stockStatus === 'in' && qty <= min) return false;
        if (filters.stockStatus === 'low' && !(qty > 0 && qty <= min)) return false;
        if (filters.stockStatus === 'out' && qty !== 0) return false;
      }

      return true;
    });
  }, [items, filters]);

  // --- SUMMARY STATS (from filtered data) ---
  const stats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalUnits = filteredItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const totalValue = filteredItems.reduce((sum, i) => sum + (i.stockValue || 0), 0);
    const lowStock = filteredItems.filter(
      (i) => i.quantity > 0 && i.quantity <= i.minimumStockLevel
    ).length;
    const outOfStock = filteredItems.filter((i) => i.quantity === 0).length;
    const totalCategories = new Set(filteredItems.map((i) => i.category?._id).filter(Boolean)).size;

    return { totalItems, totalUnits, totalValue, lowStock, outOfStock, totalCategories };
  }, [filteredItems]);

  // --- CATEGORY BREAKDOWN ---
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredItems.forEach((item) => {
      const catId = item.category?._id || 'uncategorized';
      const catName = item.category?.name || 'Uncategorized';
      if (!map[catId]) {
        map[catId] = { name: catName, count: 0, units: 0, value: 0 };
      }
      map[catId].count += 1;
      map[catId].units += item.quantity || 0;
      map[catId].value += item.stockValue || 0;
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [filteredItems]);

  // --- PAGINATION ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      supplier: 'all',
      stockStatus: 'all',
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Format number with thousand separators
  const formatNumber = (n) => (n || 0).toLocaleString('en-US');

  const formatCurrency = (n) =>
    (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Get stock status badge
  const getStockStatus = (item) => {
    const qty = item.quantity || 0;
    const min = item.minimumStockLevel || 0;
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    if (qty <= min) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Code',
      'Item Name',
      'Category',
      'Supplier',
      'Unit',
      'Quantity',
      'Min Stock',
      'Unit Price',
      'Stock Value',
      'Status',
    ];

    const rows = filteredItems.map((item) => {
      const status = getStockStatus(item);
      return [
        item.code || '',
        item.name || '',
        item.category?.name || '',
        item.supplier?.companyName || '',
        item.unit || '',
        item.quantity || 0,
        item.minimumStockLevel || 0,
        item.latestUnitPrice || 0,
        item.stockValue || 0,
        status.label,
      ];
    });

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Stock report exported successfully');
  };

  // Print
  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading stock report...</p>
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
              <FaChartBar className="text-blue-600" />
              Stock Report
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Current inventory valuation and stock level analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <FaPrint /> Print
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              onClick={fetchStockReport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
            >
              <FaArrowRight className="text-xs" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Items</p>
            <FaBoxes className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatNumber(stats.totalItems)}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.totalCategories} categor{stats.totalCategories === 1 ? 'y' : 'ies'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Units</p>
            <FaWarehouse className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatNumber(stats.totalUnits)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Across all items</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stock Value</p>
            <FaMoneyBillWave className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalValue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">ETB</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Low Stock</p>
            <FaExclamationTriangle className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatNumber(stats.lowStock)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Below minimum</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Out of Stock</p>
            <FaTimesCircle className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatNumber(stats.outOfStock)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Needs attention</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FaListAlt className="text-blue-500" />
            Top Categories by Value
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-500">
                    {cat.count} item{cat.count !== 1 ? 's' : ''} • {formatNumber(cat.units)} units
                  </p>
                </div>
                <p className="text-sm font-bold text-purple-600">{formatCurrency(cat.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={filters.search}
              onChange={(e) => {
                setFilters((p) => ({ ...p, search: e.target.value }));
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
              {(filters.category !== 'all' ||
                filters.supplier !== 'all' ||
                filters.stockStatus !== 'all') && (
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
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <FaTag className="text-xs text-slate-400" /> Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, category: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <FaTruck className="text-xs text-slate-400" /> Supplier
              </label>
              <select
                value={filters.supplier}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, supplier: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Status</label>
              <select
                value={filters.stockStatus}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, stockStatus: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FaExclamationTriangle className="text-4xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-600">
            {filters.search ||
            filters.category !== 'all' ||
            filters.supplier !== 'all' ||
            filters.stockStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No items have been added yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Supplier
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Min
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item, idx) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {indexOfFirst + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.code}</p>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {item.category?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-slate-600">
                            {item.supplier?.companyName || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-slate-800">
                            {formatNumber(item.quantity)}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-center hidden md:table-cell">
                          <span className="text-sm text-slate-500">{item.minimumStockLevel}</span>
                        </td>
                        <td className="py-3 px-4 text-right hidden md:table-cell">
                          <span className="text-sm text-slate-600">
                            {item.latestUnitPrice > 0 ? formatCurrency(item.latestUnitPrice) : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-purple-600">
                            {item.stockValue > 0 ? formatCurrency(item.stockValue) : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => navigate(`/admin/item-detail/${item._id}`)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Item"
                          >
                            <FaEye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals Row */}
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan="4" className="py-3 px-4 text-right text-sm font-semibold text-slate-700">
                      Grand Total
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-bold text-slate-800">
                      {formatNumber(stats.totalUnits)}
                    </td>
                    <td colSpan="2" className="hidden md:table-cell"></td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-purple-600">
                      {formatCurrency(stats.totalValue)} ETB
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredItems.length)} of{' '}
                {filteredItems.length} items
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    return (
                      <span key={idx} className="px-1 text-slate-400">
                        …
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

      {/* Footer Note */}
      <div className="mt-6 text-center text-xs text-slate-400">
        <p>
          Report generated on {new Date().toLocaleDateString()} • Stock value is based on latest
          Stock In unit price
        </p>
      </div>
    </div>
  );
};

export default StockReport;