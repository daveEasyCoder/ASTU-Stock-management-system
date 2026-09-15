// pages/adminPages/StockAdjustment.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaBoxes,
  FaPlusCircle,
  FaMinusCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaArrowLeft,
  FaSearch,
  FaHistory,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';


const StockAdjustment = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    itemId: '',
    adjustmentType: 'Increase',
    quantity: '',
    reason: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/items/get-items');
      if (response.data.success) {
        setItems(response.data.items.filter(i => i.isActive));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.code.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // When an item is selected
  const handleItemSelect = (item) => {
    setFormData(prev => ({ ...prev, itemId: item._id }));
    setSelectedItem(item);
    setItemSearch('');
    if (errors.itemId) setErrors(prev => ({ ...prev, itemId: undefined }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Please select an item.';
    }

    const qty = parseInt(formData.quantity, 10);
    if (!formData.quantity || isNaN(qty) || qty < 1) {
      newErrors.quantity = 'Quantity must be at least 1.';
    } else if (
      formData.adjustmentType === 'Decrease' &&
      selectedItem &&
      qty > selectedItem.quantity
    ) {
      newErrors.quantity = `Cannot decrease more than available stock (${selectedItem.quantity} ${selectedItem.unit}).`;
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for adjustment.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all validation errors.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/stock-adjustments/adjust', {
        itemId: formData.itemId,
        adjustmentType: formData.adjustmentType,
        quantity: parseInt(formData.quantity, 10),
        reason: formData.reason.trim(),
        remarks: formData.remarks.trim(),
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setFormData({
          itemId: '',
          adjustmentType: 'Increase',
          quantity: '',
          reason: '',
          remarks: '',
        });
        setSelectedItem(null);
        setErrors({});
        // Refresh items list (to update quantity)
        fetchItems();
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error(error.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      itemId: '',
      adjustmentType: 'Increase',
      quantity: '',
      reason: '',
      remarks: '',
    });
    setSelectedItem(null);
    setErrors({});
    setItemSearch('');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaBoxes className="text-blue-600" />
              Stock Adjustment
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manually increase or decrease stock with reason
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/transactions')}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <FaHistory />
            View History
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-base font-semibold text-white">Adjustment Details</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            All adjustments are logged in stock transactions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Item <span className="text-red-500">*</span>
            </label>

            {selectedItem ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaBoxes className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedItem.name}</p>
                    <p className="text-xs text-slate-500">
                      {selectedItem.code} • Current: {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    setFormData(prev => ({ ...prev, itemId: '' }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search item by name or code..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown results */}
                {itemSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500">No items found</p>
                    ) : (
                      filteredItems.slice(0, 10).map(item => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => handleItemSelect(item)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.code} • Stock: {item.quantity} {item.unit}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.itemId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FaExclamationCircle size={12} />
                {errors.itemId}
              </p>
            )}
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'Increase' }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.adjustmentType === 'Increase'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <FaPlusCircle />
                <span className="text-sm font-medium">Increase Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'Decrease' }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.adjustmentType === 'Decrease'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <FaMinusCircle />
                <span className="text-sm font-medium">Decrease Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity <span className="text-red-500">*</span>
              {selectedItem && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({selectedItem.unit})
                </span>
              )}
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, quantity: e.target.value }));
                if (errors.quantity) setErrors(prev => ({ ...prev, quantity: undefined }));
              }}
              placeholder="Enter quantity"
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.quantity
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FaExclamationCircle size={12} />
                {errors.quantity}
              </p>
            )}
            {selectedItem && (
              <p className="mt-1 text-xs text-slate-500">
                Current stock: {selectedItem.quantity} {selectedItem.unit}
                {formData.quantity && !isNaN(parseInt(formData.quantity)) && (
                  <span className="ml-2 font-medium text-blue-600">
                    → New:{' '}
                    {formData.adjustmentType === 'Increase'
                      ? selectedItem.quantity + parseInt(formData.quantity || 0)
                      : Math.max(0, selectedItem.quantity - parseInt(formData.quantity || 0))}{' '}
                    {selectedItem.unit}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, reason: e.target.value }));
                if (errors.reason) setErrors(prev => ({ ...prev, reason: undefined }));
              }}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.reason
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a reason</option>
              {formData.adjustmentType === 'Increase' ? (
                <>
                  <option value="Returned from department">Returned from department</option>
                  <option value="Found missing items">Found missing items</option>
                  <option value="Stock verification correction">Stock verification correction</option>
                  <option value="Data entry error correction">Data entry error correction</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Damaged items">Damaged items</option>
                  <option value="Lost items">Lost items</option>
                  <option value="Expired items">Expired items</option>
                  <option value="Theft">Theft</option>
                  <option value="Data entry error correction">Data entry error correction</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FaExclamationCircle size={12} />
                {errors.reason}
              </p>
            )}
          </div>

          {/* Remarks (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remarks <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Additional notes about this adjustment..."
              rows="3"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Info Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">This action will:</p>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>
                    {formData.adjustmentType === 'Increase' ? 'Increase' : 'Decrease'} item
                    quantity by the specified amount
                  </li>
                  <li>Create an "Adjustment" stock transaction</li>
                  <li>Be logged with your name and timestamp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  {formData.adjustmentType === 'Increase' ? 'Increase Stock' : 'Decrease Stock'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustment;