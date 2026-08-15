import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTags,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const UpdateCategory = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      setFetching(true);
      try {
        const response = await axios.get(`${BASIC_URL}/api/categories/get-category/${id}`);
        
        if (response.data.success) {
          const category = response.data.category;
          setFormData({
            name: category.name || '',
            description: category.description || ''
          });
          setOriginalData({
            name: category.name || '',
            description: category.description || ''
          });
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category data');
        navigate('/admin/category-list');
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id, BASIC_URL, navigate]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          newErrors.name = 'Category name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Category name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.name = 'Category name must be less than 50 characters';
        } else if (!/^[a-zA-Z0-9\s\-_&]+$/.test(value.trim())) {
          newErrors.name = 'Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands';
        } else {
          delete newErrors.name;
        }
        break;

      case 'description':
        if (value && value.trim().length > 200) {
          newErrors.description = 'Description must be less than 200 characters';
        } else {
          delete newErrors.description;
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
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      validateField(name, value);
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

  // Validate all fields before submit
  const validateForm = () => {
    const allErrors = {};
    const fields = ['name'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    setErrors(allErrors);
    setTouched({
      name: true,
      description: true
    });

    return Object.keys(allErrors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description
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
      const submitData = {};
      
      if (formData.name !== originalData.name) {
        submitData.name = formData.name.trim();
      }
      
      if (formData.description !== originalData.description) {
        submitData.description = formData.description.trim() || '';
      }

      const response = await axios.put(
        `${BASIC_URL}/api/categories/update-category/${id}`,
        submitData
      );

      if (response.data.success) {
        toast.success('Category updated successfully!');
        setTimeout(() => {
          navigate(`/admin/category-detail/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to update category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: originalData.name,
      description: originalData.description
    });
    setErrors({});
    setTouched({});
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading category data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/category-detail/${id}`)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Category Details
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
              <p className="mt-1 text-gray-600">Update category information and settings</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaTags className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Edit Category</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div>
              <h2 className="text-lg font-semibold text-white">Category Information</h2>
              <p className="text-sm text-blue-100 mt-1">Update the details for this category</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTags className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter category name (e.g., Electronics, Furniture)"
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
                  {formData.name ? formData.name.length : 0}/50 characters
                </span>
                {formData.name && formData.name.length > 40 && (
                  <span className="text-xs text-yellow-600">
                    Getting long
                  </span>
                )}
              </div>
            </div>

            {/* Category Description */}
            <div>
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
                  placeholder="Enter a brief description of the category (optional)"
                  rows="4"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    errors.description && touched.description
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.description && !errors.description && formData.description
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {touched.description && !errors.description && formData.description && (
                  <div className="absolute top-3 right-0 pr-3 flex items-center">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
              {errors.description && touched.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle size={12} />
                  {errors.description}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formData.description ? formData.description.length : 0}/200 characters
                </span>
                {formData.description && formData.description.length > 150 && (
                  <span className="text-xs text-yellow-600">
                    Getting long
                  </span>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {formData.name && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaTags className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formData.name}
                    </p>
                    {formData.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {formData.description}
                      </p>
                    )}
                  </div>
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
                type="button"
                onClick={() => navigate(`/admin/category-detail/${id}`)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaArrowLeft />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges()}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Category name must be unique and cannot be duplicated</li>
                  <li>Changing category name may affect items in this category</li>
                  <li>Description is optional but helps with organization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCategory;