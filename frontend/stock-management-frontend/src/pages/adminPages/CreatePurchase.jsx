import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig'
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaShoppingCart,
  FaTruck,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaBoxes,
  FaTag,
  FaInfoCircle,
  FaFileInvoice,
  FaRandom
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const CreatePurchase = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    supplier: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [purchasedItems, setPurchasedItems] = useState([
    { item: '', quantity: 1, unitPrice: 0 }
  ]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Generate a random invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `INV-${year}-${random}`;
  };

  // Handle generate button click
  const handleGenerateInvoice = () => {
    const newInvoice = generateInvoiceNumber();
    setFormData(prev => ({
      ...prev,
      invoiceNumber: newInvoice
    }));
    // Clear error if any
    if (errors.invoiceNumber) {
      setErrors(prev => ({ ...prev, invoiceNumber: undefined }));
    }
    // Mark as touched to show validation state
    setTouched(prev => ({ ...prev, invoiceNumber: true }));
    toast.success('Invoice number generated!');
  };

  // Fetch suppliers and items
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch suppliers
        const supResponse = await axiosInstance.get(`/api/suppliers/get-suppliers`);
        if (supResponse.data.success) {
          setSuppliers(supResponse.data.suppliers);
        }

        // Fetch items
        const itemResponse = await axiosInstance.get(`/api/items/get-items`);
        if (itemResponse.data.success) {
          setItems(itemResponse.data.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [BASIC_URL]);

  // Calculate total amount
  const calculateTotal = () => {
    return purchasedItems.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

  // Add new item row
  const addItemRow = () => {
    setPurchasedItems([...purchasedItems, { item: '', quantity: 1, unitPrice: 0 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (purchasedItems.length <= 1) {
      toast.warning('At least one item is required');
      return;
    }
    const newItems = purchasedItems.filter((_, i) => i !== index);
    setPurchasedItems(newItems);
  };

  // Update item row
  const updateItemRow = (index, field, value) => {
    const newItems = [...purchasedItems];
    newItems[index][field] = value;
    setPurchasedItems(newItems);
  };

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'supplier':
        if (!value) {
          newErrors.supplier = 'Supplier is required';
        } else {
          delete newErrors.supplier;
        }
        break;

      case 'invoiceNumber':
        if (!value || value.trim().length === 0) {
          newErrors.invoiceNumber = 'Invoice number is required';
        } else if (value.trim().length > 50) {
          newErrors.invoiceNumber = 'Invoice number must be less than 50 characters';
        } else {
          delete newErrors.invoiceNumber;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  // Validate all fields
  const validateForm = () => {
    const allErrors = {};

    // Validate supplier
    if (!formData.supplier) {
      allErrors.supplier = 'Supplier is required';
    }

    // Validate invoice number
    if (!formData.invoiceNumber || formData.invoiceNumber.trim().length === 0) {
      allErrors.invoiceNumber = 'Invoice number is required';
    }

    // Validate purchased items
    for (let i = 0; i < purchasedItems.length; i++) {
      const item = purchasedItems[i];
      if (!item.item) {
        allErrors[`item_${i}`] = 'Item is required';
      }
      if (!item.quantity || item.quantity < 1) {
        allErrors[`quantity_${i}`] = 'Quantity must be at least 1';
      }
      if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice < 0) {
        allErrors[`unitPrice_${i}`] = 'Unit price must be positive';
      }
    }

    setErrors(allErrors);
    setTouched({
      supplier: true,
      invoiceNumber: true,
      purchaseDate: true
    });

    return Object.keys(allErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber.trim(),
        purchaseDate: formData.purchaseDate,
        purchasedItems: purchasedItems.map(item => ({
          item: item.item,
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice)
        })),
        remarks: formData.remarks.trim() || ''
      };

      const response = await axiosInstance.post(
        `/api/purchases/create-purchase`,
        submitData
      );

      if (response.data.success) {
        toast.success('Purchase created successfully! Stock has been updated.');
        setTimeout(() => {
          navigate('/admin/purchase-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to create purchase. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      supplier: '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setPurchasedItems([{ item: '', quantity: 1, unitPrice: 0 }]);
    setErrors({});
    setTouched({});
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/admin/purchase-list')}
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm sm:text-base"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Purchase List
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Purchase</h1>
              <p className="text-sm sm:text-base text-slate-600">Record a new purchase order</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaShoppingCart className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New Purchase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-base sm:text-lg font-semibold text-white">Purchase Information</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Fill in the details below to create a new purchase</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Supplier & Invoice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTruck className="text-slate-400" />
                  </div>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.supplier && touched.supplier
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup._id} value={sup._id}>
                        {sup.companyName} {!sup.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.supplier && touched.supplier && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.supplier}
                  </p>
                )}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invoice Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFileInvoice className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter invoice number or generate"
                    className={`w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.invoiceNumber && touched.invoiceNumber
                        ? 'border-rose-500 focus:ring-rose-500'
                        : touched.invoiceNumber && !errors.invoiceNumber && formData.invoiceNumber
                          ? 'border-emerald-500 focus:ring-emerald-500'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-r-lg transition-colors flex items-center gap-1"
                    title="Generate random invoice number"
                  >
                    <FaRandom className="text-xs" />
                    Generate
                  </button>
                </div>
                {errors.invoiceNumber && touched.invoiceNumber && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.invoiceNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Click "Generate" to auto-create a random invoice number
                </p>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purchase Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-slate-400" />
                  </div>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Remarks <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaInfoCircle className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Add any notes..."
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Purchased Items Section */}
            <div className="border-t border-slate-200 pt-5 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FaBoxes className="text-blue-500" /> Purchased Items
                </h3>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <FaPlus className="text-xs" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {purchasedItems.map((item, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      {/* Item */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Item <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <FaTag className="text-slate-400 text-xs" />
                          </div>
                          <select
                            value={item.item}
                            onChange={(e) => updateItemRow(index, 'item', e.target.value)}
                            className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors[`item_${index}`]
                                ? 'border-rose-500 focus:ring-rose-500'
                                : 'border-slate-300 focus:ring-blue-500'
                              }`}
                          >
                            <option value="">Select item</option>
                            {items.map((i) => (
                              <option key={i._id} value={i._id}>
                                {i.name} ({i.code}) - Stock: {i.quantity} {i.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[`item_${index}`] && (
                          <p className="mt-0.5 text-xs text-rose-600">{errors[`item_${index}`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Quantity <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors[`quantity_${index}`]
                              ? 'border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors[`quantity_${index}`] && (
                          <p className="mt-0.5 text-xs text-rose-600">{errors[`quantity_${index}`]}</p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Unit Price <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || val === '-') {
                              updateItemRow(index, 'unitPrice', 0);
                            } else {
                              const num = parseFloat(val);
                              if (!isNaN(num) && num >= 0) {
                                updateItemRow(index, 'unitPrice', num);
                              }
                            }
                          }}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors[`unitPrice_${index}`]
                              ? 'border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors[`unitPrice_${index}`] && (
                          <p className="mt-0.5 text-xs text-rose-600">{errors[`unitPrice_${index}`]}</p>
                        )}
                      </div>

                      {/* Subtotal & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Subtotal</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-4 flex justify-end">
                <div className="bg-blue-50 rounded-xl px-6 py-3 border border-blue-200">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalAmount.toFixed(2)} ETB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 sm:pt-6 border-t border-slate-200">
              <div className="flex w-full sm:w-auto gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes />
                  Reset
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto cursor-pointer px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create Purchase
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <ul className="mt-1 text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Stock quantities will be automatically updated</li>
                <li>Stock transactions will be created for each item</li>
                <li>Invoice number must be unique</li>
                <li>At least one item is required</li>
                <li>Only active suppliers and items can be selected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchase;