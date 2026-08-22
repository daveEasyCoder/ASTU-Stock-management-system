import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxes,
  FaCode,
  FaTag,
  FaCube,
  FaInfoCircle,
  FaPlus,
  FaCamera,
  FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';
import axiosInstance from '../../utils/axiosConfig'

const CreateItem = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
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
  const [codeSuggestion, setCodeSuggestion] = useState('');

  const units = [
    'Piece',
    'Box',
    'Pack',
    'Kg',
    'Gram',
    'Liter',
    'Meter',
    'Roll',
    'Set'
  ];

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch categories
        const catResponse = await axiosInstance.get(`/api/categories/get-categories`);
        if (catResponse.data.success) {
          setCategories(catResponse.data.categories);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [BASIC_URL]);

  // Generate a suggested code based on name + random number
  const generateCode = () => {
    if (!formData.name) {
      toast.info('Please enter a name first to generate a code');
      return;
    }
    const namePart = formData.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    const code = `${namePart}-${randomNum}`;
    setFormData(prev => ({ ...prev, code }));
    setTouched(prev => ({ ...prev, code: true }));
    toast.success('Code generated');
  };

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

      case 'code':
        if (!value || value.trim().length === 0) {
          newErrors.code = 'Item code is required';
        } else if (value.trim().length < 3) {
          newErrors.code = 'Item code must be at least 3 characters';
        } else if (value.trim().length > 20) {
          newErrors.code = 'Item code must be less than 20 characters';
        } else if (!/^[A-Z0-9\-]+$/.test(value.trim().toUpperCase())) {
          newErrors.code = 'Item code can only contain uppercase letters, numbers, and hyphens';
        } else {
          delete newErrors.code;
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WebP)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const allErrors = {};
    const fields = ['name', 'code', 'category', 'unit', 'minimumStockLevel'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    setErrors(allErrors);
    setTouched({
      name: true,
      code: true,
      category: true,
      unit: true,
      minimumStockLevel: true,
      description: true
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
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('code', formData.code.trim().toUpperCase());
      submitData.append('category', formData.category);
      submitData.append('unit', formData.unit);
      submitData.append('description', formData.description.trim() || '');
      submitData.append('minimumStockLevel', formData.minimumStockLevel);
      submitData.append('isActive', formData.isActive);
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await axiosInstance.post(
        `/api/items/create-item`,
        submitData,
        {
        //   withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Item created successfully!');
        setTimeout(() => {
          navigate('/admin/item-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to create item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      unit: '',
      description: '',
      minimumStockLevel: 0,
      isActive: true
    });
    setErrors({});
    setTouched({});
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/item-list')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Item List
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Item</h1>
              <p className="mt-1 text-gray-600">Add a new item to the inventory</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaBoxes className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New Item</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-semibold text-white">Item Information</h2>
            <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new item</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBoxes className="text-gray-400" />
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
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.name && !errors.name && formData.name
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {touched.name && !errors.name && formData.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.name}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.name ? formData.name.length : 0}/100 characters
                  </span>
                  {formData.name && formData.name.length > 80 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCode className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter item code (e.g., ITM-001)"
                    className={`w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors uppercase ${
                      errors.code && touched.code
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.code && !errors.code && formData.code
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    disabled={!formData.name}
                    className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate
                  </button>
                </div>
                {errors.code && touched.code && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.code}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.code ? formData.code.length : 0}/20 characters
                  </span>
                  <span className="text-xs text-gray-400">
                    Uppercase letters, numbers, hyphens
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="text-gray-400" />
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.category && touched.category
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
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
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCube className="text-gray-400" />
                  </div>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.unit && touched.unit
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a unit</option>
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                {errors.unit && touched.unit && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.unit}
                  </p>
                )}
              </div>

              {/* Minimum Stock Level */}
              <div className='md:col-span-2'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaInfoCircle className="text-gray-400" />
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
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.minimumStockLevel && !errors.minimumStockLevel
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {touched.minimumStockLevel && !errors.minimumStockLevel && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.minimumStockLevel && touched.minimumStockLevel && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.minimumStockLevel}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Items will show low stock alert when quantity falls below this level
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FaInfoCircle className="text-gray-400 mt-0.5" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter item description (optional)"
                    rows="3"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.description ? formData.description.length : 0}/500 characters
                  </span>
                  {formData.description && formData.description.length > 400 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <FaBoxes className="text-gray-400 text-3xl" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
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
                  <p className="mt-1 text-xs text-gray-500">
                    JPEG, PNG, WebP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
                <span className="ml-2 text-xs text-gray-400">
                  (Inactive items will be hidden from selection)
                </span>
              </div>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.code) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FaBoxes className="text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">
                        {formData.name || 'Item Name'}
                      </p>
                      {formData.code && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {formData.code}
                        </span>
                      )}
                      {formData.unit && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {formData.unit}
                        </span>
                      )}
                    </div>
                    {formData.category && (
                      <p className="text-sm text-gray-500">
                        Category: {categories.find(c => c._id === formData.category)?.name || 'Selected'}
                      </p>
                    )}
                    {formData.minimumStockLevel > 0 && (
                      <p className="text-sm text-gray-500">
                        Min Stock: {formData.minimumStockLevel}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>



        {/* Important Notes */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
              <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                <li>• Item code must be unique</li>
                <li>• Category must be active</li>
                <li>• Initial quantity is always 0 (will be updated via purchases)</li>
                <li>• Minimum stock level triggers low stock alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItem;