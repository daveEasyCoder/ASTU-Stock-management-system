import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxes,
  FaTag,
  FaCube,
  FaInfoCircle,
  FaCamera,
  FaTrash,
  FaHashtag,
  FaPercent
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';
import axiosInstance from '../../utils/axiosConfig';

const UpdateItem = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    unit: '',
    description: '',
    minimumStockLevel: 0,
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const units = [
    'Piece', 'Box', 'Pack', 'Kg', 'Gram',
    'Liter', 'Meter', 'Roll', 'Set'
  ];

  // Fetch item data, categories
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      setLoadingData(true);
      try {
        // Fetch item details
        const itemResponse = await axiosInstance.get(`/api/items/get-item/${id}`);
        
        if (itemResponse.data.success) {
          const item = itemResponse.data.item;
          
          setFormData({
            name: item.name || '',
            code: item.code || '',
            category: item.category?._id || '',
            unit: item.unit || '',
            description: item.description || '',
            minimumStockLevel: item.minimumStockLevel || 0,
            isActive: item.isActive !== undefined ? item.isActive : true
          });
          setOriginalData({
            name: item.name || '',
            code: item.code || '',
            category: item.category?._id || '',
            unit: item.unit || '',
            description: item.description || '',
            minimumStockLevel: item.minimumStockLevel || 0,
            quantity:item.quantity || 0,
            isActive: item.isActive !== undefined ? item.isActive : true
          });
          if (item.image) {
            setImagePreview(`${BASIC_URL}/uploads/items/${item.image}`);
          }
        }

        // Fetch categories
        const catResponse = await axiosInstance.get(`/api/categories/get-categories`);
        if (catResponse.data.success) {
          setCategories(catResponse.data.categories);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        navigate('/admin/item-list');
      } finally {
        setFetching(false);
        setLoadingData(false);
      }
    };

    window.scrollTo(0,0)
    fetchData();
  }, [id, BASIC_URL, navigate]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          newErrors.name = 'Item name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Item name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Item name must be less than 100 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'category':
        if (!value) {
          newErrors.category = 'Category is required';
        } else {
          delete newErrors.category;
        }
        break;

      case 'unit':
        if (!value) {
          newErrors.unit = 'Unit is required';
        } else {
          delete newErrors.unit;
        }
        break;

      case 'minimumStockLevel':
        if (value === '' || value === null || value === undefined) {
          newErrors.minimumStockLevel = 'Minimum stock level is required';
        } else if (value < 0) {
          newErrors.minimumStockLevel = 'Minimum stock level cannot be negative';
        } else {
          delete newErrors.minimumStockLevel;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    if (touched[name]) {
      validateField(name, val);
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const allErrors = {};
    const fields = ['name', 'category', 'unit', 'minimumStockLevel'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    setErrors(allErrors);
    setTouched({
      name: true,
      category: true,
      unit: true,
      minimumStockLevel: true,
      description: true
    });

    return Object.keys(allErrors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.category !== originalData.category ||
      formData.unit !== originalData.unit ||
      formData.description !== originalData.description ||
      formData.minimumStockLevel !== originalData.minimumStockLevel ||
      formData.isActive !== originalData.isActive ||
      imageFile !== null ||
      removeImage
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    if (!hasChanges()) {
      toast.info('No changes to update');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      if (formData.name !== originalData.name) {
        submitData.append('name', formData.name.trim());
      }
      
      if (formData.category !== originalData.category) {
        submitData.append('category', formData.category);
      }
      
      if (formData.unit !== originalData.unit) {
        submitData.append('unit', formData.unit);
      }
      
      if (formData.description !== originalData.description) {
        submitData.append('description', formData.description.trim() || '');
      }
      
      if (formData.minimumStockLevel !== originalData.minimumStockLevel) {
        submitData.append('minimumStockLevel', formData.minimumStockLevel);
      }
      
      if (formData.isActive !== originalData.isActive) {
        submitData.append('isActive', formData.isActive);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (removeImage && !imageFile) {
        submitData.append('image', '');
      }

      const response = await axiosInstance.put(
        `/api/items/update-item/${id}`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Item updated successfully!');
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to update item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: originalData.name,
      code: originalData.code,
      category: originalData.category,
      unit: originalData.unit,
      description: originalData.description,
      minimumStockLevel: originalData.minimumStockLevel,
      isActive: originalData.isActive
    });
    setErrors({});
    setTouched({});
    setImageFile(null);
    setRemoveImage(false);
    // Restore original image preview
    if (originalData.image) {
      setImagePreview(`${BASIC_URL}/uploads/items/${originalData.image}`);
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (fetching || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading item data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/admin/item-detail/${id}`)}
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm sm:text-base"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Item Details
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Edit Item</h1>
              <p className="text-sm sm:text-base text-slate-600">Update item information and settings</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaBoxes className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Edit Item</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white">Item Information</h2>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">Update the details for this item</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                  formData.isActive 
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  <FaHashtag className="mr-1" /> {formData.code}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Image Upload */}
            <div className="border-b border-slate-200 pb-4 sm:pb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Item Image <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <FaBoxes className="text-slate-400 text-3xl sm:text-4xl" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaCamera />
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    JPEG, PNG, WebP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBoxes className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter item name"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.name && touched.name
                        ? 'border-rose-500 focus:ring-rose-500'
                        : touched.name && !errors.name && formData.name
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {touched.name && !errors.name && formData.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-emerald-500" />
                    </div>
                  )}
                </div>
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.name}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {formData.name ? formData.name.length : 0}/100 characters
                  </span>
                </div>
              </div>

              {/* Code - Read Only */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Code <span className="text-slate-400 text-xs">(Auto-generated)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaHashtag className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.code}
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Code cannot be changed after creation
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="text-slate-400" />
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.category && touched.category
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} {!cat.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && touched.category && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.category}
                  </p>
                )}
              </div>


              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCube className="text-slate-400" />
                  </div>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.unit && touched.unit
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a unit</option>
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                {errors.unit && touched.unit && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.unit}
                  </p>
                )}
              </div>

              {/* Minimum Stock Level */}
              <div className='sm:col-span-2'>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Stock Level <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPercent className="text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="minimumStockLevel"
                    value={formData.minimumStockLevel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"
                    min="0"
                    step="1"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.minimumStockLevel && touched.minimumStockLevel
                        ? 'border-rose-500 focus:ring-rose-500'
                        : touched.minimumStockLevel && !errors.minimumStockLevel
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {touched.minimumStockLevel && !errors.minimumStockLevel && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-emerald-500" />
                    </div>
                  )}
                </div>
                {errors.minimumStockLevel && touched.minimumStockLevel && (
                  <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.minimumStockLevel}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Items show low stock alert when quantity falls below this level
                </p>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FaInfoCircle className="text-slate-400 mt-0.5" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter item description (optional)"
                    rows="3"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {formData.description ? formData.description.length : 0}/500 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="border-t border-slate-200 pt-5 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Item Status
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.isActive 
                      ? 'Item is active and available in inventory' 
                      : 'Item is inactive and hidden from selection'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    formData.isActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.code) && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Preview</h4>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      formData.isActive ? 'bg-blue-100' : 'bg-slate-200'
                    }`}>
                      <FaBoxes className={formData.isActive ? 'text-blue-600' : 'text-slate-500'} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-medium ${formData.isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {formData.name || 'Item Name'}
                      </p>
                      {formData.code && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {formData.code}
                        </span>
                      )}
                      {formData.unit && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {formData.unit}
                        </span>
                      )}
                    </div>
                    {formData.category && (
                      <p className="text-sm text-slate-500">
                        Category: {categories.find(c => c._id === formData.category)?.name || 'Selected'}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    formData.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Note - Read Only */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-amber-600 mt-0.5 text-sm sm:text-base" />
                <div className="text-xs sm:text-sm">
                  <p className="font-medium text-amber-800">Quantity Not Editable</p>
                  <p className="text-amber-700 mt-1">
                    Current quantity: <strong>{originalData.quantity || 0}</strong> {formData.unit}. 
                    Quantity can only be changed through <strong>Stock In</strong>, <strong>Stock Out</strong>, 
                    or <strong>Adjustment</strong> transactions.
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
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaArrowLeft />
                  Cancel
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || !hasChanges()}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <FaExclamationCircle className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <ul className="mt-1 text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Item code is auto-generated and cannot be changed</li>
                <li>Quantity must be updated via stock transactions</li>
                <li>Inactive items are hidden from selection</li>
                <li>Category must be active to assign</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateItem;