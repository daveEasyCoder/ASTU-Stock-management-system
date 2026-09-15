// pages/CreateStockRequest.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
  FaSave,
  FaTimes,
  FaShoppingCart
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const CreateStockRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    remarks: '',
  });
  
  const [requestItems, setRequestItems] = useState([
    { item: '', quantity: 1 }
  ]);
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [preSelectedItemId, setPreSelectedItemId] = useState(null);

  // Get user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch available items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/items/get-items');
        if (response.data.success) {
          // Only show active items with stock > 0
          const availableItems = response.data.items.filter(
            item => item.isActive && item.quantity > 0
          );
          setItems(availableItems);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Check for pre-selected item from Available Items page
  useEffect(() => {
    const state = location.state;
    if (state?.itemId) {
      setPreSelectedItemId(state.itemId);
      setRequestItems([{ item: state.itemId, quantity: 1 }]);
    }
  }, [location.state]);

  // Add new item row
  const addItemRow = () => {
    setRequestItems([...requestItems, { item: '', quantity: 1 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (requestItems.length <= 1) {
      toast.warning('At least one item is required');
      return;
    }
    const newItems = requestItems.filter((_, i) => i !== index);
    setRequestItems(newItems);
  };

  // Update item row
  const updateItemRow = (index, field, value) => {
    const newItems = [...requestItems];
    newItems[index][field] = value;
    setRequestItems(newItems);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Validate each item
    requestItems.forEach((item, index) => {
      if (!item.item) {
        newErrors[`item_${index}`] = 'Please select an item';
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`quantity_${index}`] = 'Quantity must be at least 1';
      }
      // Check if quantity exceeds available stock
      const selectedItem = items.find(i => i._id === item.item);
      if (selectedItem && item.quantity > selectedItem.quantity) {
        newErrors[`quantity_${index}`] = `Only ${selectedItem.quantity} ${selectedItem.unit} available`;
      }
    });

    // Check for duplicate items
    const itemIds = requestItems.map(item => item.item).filter(id => id);
    const uniqueIds = new Set(itemIds);
    if (itemIds.length !== uniqueIds.size) {
      newErrors.duplicate = 'Duplicate items are not allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    // Check if user has department
    if (!user?.department) {
      toast.error('You are not assigned to a department. Please contact administrator.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        requestedItems: requestItems.map(item => ({
          item: item.item,
          quantity: parseInt(item.quantity, 10)
        })),
        remarks: formData.remarks.trim() || '',
      };
      
      const response = await axiosInstance.post(
        '/api/stock-requests/create-request',
        submitData
      );

      if (response.data.success) {
        toast.success('Stock request created successfully!');
        setTimeout(() => {
          navigate('/user/my-requests');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
        if (data.errors) {
          Object.values(data.errors).forEach(err => toast.error(err));
        }
      } else {
        toast.error('Failed to create request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setRequestItems([{ item: '', quantity: 1 }]);
    setFormData({ remarks: '' });
    setErrors({});
    setTouched({});
  };

  // Get selected item details for display
  const getSelectedItem = (itemId) => {
    return items.find(i => i._id === itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600">Loading available items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              <FaShoppingCart className="text-blue-600" />
              Create Stock Request
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Request items from the store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {user?.department?.name || 'No Department'}
            </span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-base font-semibold text-white">Request Details</h2>
          <p className="text-sm text-blue-100 mt-0.5">Select items and quantities</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Requested Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-700">
                Requested Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <FaPlus className="text-xs" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {requestItems.map((item, index) => {
                const selectedItem = getSelectedItem(item.item);
                const isPreSelected = item.item === preSelectedItemId;
                
                return (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      {/* Item */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Item <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.item}
                          onChange={(e) => {
                            updateItemRow(index, 'item', e.target.value);
                            // Clear previous errors
                            if (errors[`item_${index}`]) {
                              setErrors(prev => ({ ...prev, [`item_${index}`]: undefined }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors[`item_${index}`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-300 focus:ring-blue-500'
                          } ${isPreSelected ? 'bg-blue-50' : ''}`}
                          disabled={isPreSelected}
                        >
                          <option value="">Select an item</option>
                          {items.map(i => (
                            <option key={i._id} value={i._id}>
                              {i.name} ({i.code}) - Available: {i.quantity} {i.unit}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            updateItemRow(index, 'quantity', parseInt(e.target.value) || 0);
                            if (errors[`quantity_${index}`]) {
                              setErrors(prev => ({ ...prev, [`quantity_${index}`]: undefined }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors[`quantity_${index}`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-300 focus:ring-blue-500'
                          }`}
                        />
                        {errors[`quantity_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>
                        )}
                      </div>

                      {/* Available & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {selectedItem && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Available</p>
                            <p className="text-sm font-medium text-slate-700">
                              {selectedItem.quantity} {selectedItem.unit}
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.duplicate && (
              <p className="mt-2 text-sm text-red-600">{errors.duplicate}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Remarks <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Add any notes about this request (e.g., purpose, urgency)..."
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            />
            <div className="mt-1 flex justify-end">
              <span className="text-xs text-slate-400">
                {formData.remarks ? formData.remarks.length : 0}/500 characters
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Total Items:</span>
              <span className="font-semibold text-blue-700">{requestItems.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-medium text-slate-700">Total Quantity:</span>
              <span className="font-semibold text-blue-700">
                {requestItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-medium text-slate-700">Your Department:</span>
              <span className="font-semibold text-blue-700">
                {user?.department?.name || 'Not assigned'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Request Approval Flow</p>
                <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Your Department Head will review this request</li>
                  <li>If approved, Store Manager will issue the items</li>
                  <li>You will be notified when the status changes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes />
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaSave />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStockRequest;