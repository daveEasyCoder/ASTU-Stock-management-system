import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBuilding,
  FaCode,
  FaInfoCircle,
  FaPlus,
  FaUniversity
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const CreateDepartment = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          newErrors.name = 'Department name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Department name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Department name must be less than 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-_&.]+$/.test(value.trim())) {
          newErrors.name = 'Department name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and periods';
        } else {
          delete newErrors.name;
        }
        break;

      case 'code':
        if (!value || value.trim().length === 0) {
          newErrors.code = 'Department code is required';
        } else if (value.trim().length < 2) {
          newErrors.code = 'Department code must be at least 2 characters';
        } else if (value.trim().length > 10) {
          newErrors.code = 'Department code must be less than 10 characters';
        } else if (!/^[A-Z0-9]+$/.test(value.trim().toUpperCase())) {
          newErrors.code = 'Department code can only contain uppercase letters and numbers';
        } else {
          delete newErrors.code;
        }
        break;

      case 'description':
        if (value && value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
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
    
    // Auto-uppercase for code field
    const processedValue = name === 'code' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (touched[name]) {
      validateField(name, processedValue);
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
    const fields = ['name', 'code'];
    
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
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined
      };

      const response = await axiosInstance.post(
        `/api/departments/create-department`,
        submitData
      );

      if (response.data.success) {
        toast.success('Department created successfully!');
        // setTimeout(() => {
        //   navigate('/admin/department-list');
        // }, 1500);
      }
    } catch (error) {
      console.error('Error creating department:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to create department. Please try again.');
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
      description: ''
    });
    setErrors({});
    setTouched({});
  };

  // Generate suggested code from name
  const generateCodeFromName = () => {
    if (!formData.name) return;
    
    const words = formData.name.trim().split(' ');
    let code = '';
    
    if (words.length === 1) {
      // Single word: take first 3-4 letters
      code = words[0].substring(0, 4).toUpperCase();
    } else if (words.length === 2) {
      // Two words: take first 2 letters from each
      code = words[0].substring(0, 2).toUpperCase() + words[1].substring(0, 2).toUpperCase();
    } else {
      // Three or more words: take first letter of each
      code = words.map(word => word[0]).join('').toUpperCase();
    }
    
    // Limit to 6 characters
    code = code.substring(0, 6);
    
    setFormData(prev => ({
      ...prev,
      code: code
    }));
    
    if (touched.code) {
      validateField('code', code);
    }
    
    toast.info('Suggested code generated from department name');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/department-list')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Department List
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Department</h1>
              <p className="mt-1 text-gray-600">Add a new department to the organization</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaBuilding className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New Department</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-semibold text-white">Department Information</h2>
            <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new department</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter department name (e.g., Computer Science)"
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
                  <span className="text-xs text-yellow-600">
                    Getting long
                  </span>
                )}
              </div>
            </div>

            {/* Department Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Code <span className="text-red-500">*</span>
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
                  placeholder="Enter department code (e.g., CSE)"
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
                  onClick={generateCodeFromName}
                  disabled={!formData.name}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suggest
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
                  {formData.code ? formData.code.length : 0}/10 characters (Uppercase letters and numbers only)
                </span>
                {formData.code && formData.code.length > 8 && (
                  <span className="text-xs text-yellow-600">
                    Getting long
                  </span>
                )}
              </div>
            </div>

            {/* Department Description */}
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
                  placeholder="Enter a brief description of the department (optional)"
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
                  {formData.description ? formData.description.length : 0}/500 characters
                </span>
                {formData.description && formData.description.length > 400 && (
                  <span className="text-xs text-yellow-600">
                    Getting long
                  </span>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.code) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaUniversity className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">
                        {formData.name || 'Department Name'}
                      </p>
                      {formData.code && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {formData.code}
                        </span>
                      )}
                    </div>
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
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Department
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaCheckCircle className="text-blue-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Tips for Department Names</h4>
                <ul className="mt-1 text-sm text-blue-700 space-y-1">
                  <li>• Use full department names (e.g., Computer Science)</li>
                  <li>• Avoid abbreviations in the name field</li>
                  <li>• Be consistent with naming conventions</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaCode className="text-green-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Tips for Department Codes</h4>
                <ul className="mt-1 text-sm text-green-700 space-y-1">
                  <li>• Use 2-6 characters (e.g., CSE, IT, ENG)</li>
                  <li>• Use uppercase letters and numbers only</li>
                  <li>• Click "Suggest" to auto-generate from name</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="shrink-0">
              <FaExclamationCircle className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
              <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                <li>• Department name and code must be unique</li>
                <li>• Code is automatically converted to uppercase</li>
                <li>• Departments can be deactivated later if needed</li>
                <li>• Users can be assigned to departments after creation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDepartment;