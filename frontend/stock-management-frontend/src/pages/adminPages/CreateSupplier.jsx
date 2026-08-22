import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBuilding,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPlus,
  FaTruck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const CreateSupplier = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'companyName':
        if (!value || value.trim().length === 0) {
          newErrors.companyName = 'Company name is required';
        } else if (value.trim().length < 2) {
          newErrors.companyName = 'Company name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.companyName = 'Company name must be less than 100 characters';
        } else {
          delete newErrors.companyName;
        }
        break;

      case 'contactPerson':
        if (!value || value.trim().length === 0) {
          newErrors.contactPerson = 'Contact person name is required';
        } else if (value.trim().length < 2) {
          newErrors.contactPerson = 'Contact person name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.contactPerson = 'Contact person name must be less than 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.contactPerson = 'Contact person name should only contain letters and spaces';
        } else {
          delete newErrors.contactPerson;
        }
        break;

      case 'phone':
        const phoneRegex = /^[0-9]{10,}$/; // At least 10 digits, only numbers
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number (minimum 10 digits, numbers only)';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else if (value.length > 100) {
          newErrors.email = 'Email must be less than 100 characters';
        } else {
          delete newErrors.email;
        }
        break;

      case 'address':
        if (!value || value.trim().length === 0) {
          newErrors.address = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else if (value.trim().length > 200) {
          newErrors.address = 'Address must be less than 200 characters';
        } else {
          delete newErrors.address;
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
    const fields = ['companyName', 'contactPerson', 'phone', 'email', 'address'];

    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    setErrors(allErrors);
    setTouched({
      companyName: true,
      contactPerson: true,
      phone: true,
      email: true,
      address: true
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
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim()
      };

      const response = await axiosInstance.post(
        `/api/suppliers/create-supplier`,
        submitData
      );

      if (response.data.success) {
        toast.success('Supplier created successfully!');
        setTimeout(() => {
          navigate('/admin/supplier-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error('Failed to create supplier. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/supplier-list')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Supplier List
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Supplier</h1>
              <p className="mt-1 text-gray-600">Add a new supplier to the system</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaTruck className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New Supplier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-semibold text-white">Supplier Information</h2>
            <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new supplier</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter company name"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.companyName && touched.companyName
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.companyName && !errors.companyName && formData.companyName
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {touched.companyName && !errors.companyName && formData.companyName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.companyName && touched.companyName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.companyName}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.companyName ? formData.companyName.length : 0}/100 characters
                  </span>
                  {formData.companyName && formData.companyName.length > 80 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter contact person name"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.contactPerson && touched.contactPerson
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.contactPerson && !errors.contactPerson && formData.contactPerson
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {touched.contactPerson && !errors.contactPerson && formData.contactPerson && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.contactPerson && touched.contactPerson && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.contactPerson}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.contactPerson ? formData.contactPerson.length : 0}/50 characters
                  </span>
                  {formData.contactPerson && formData.contactPerson.length > 40 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter 10-digit phone number"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.phone && touched.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.phone && !errors.phone && formData.phone
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {touched.phone && !errors.phone && formData.phone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.email && !errors.email && formData.email
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {touched.email && !errors.email && formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.email}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.email ? formData.email.length : 0}/100 characters
                  </span>
                  {formData.email && formData.email.length > 80 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400 mt-0.5" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter full address (street, city, state, zip)"
                    rows="3"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.address && touched.address
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.address && !errors.address && formData.address
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {touched.address && !errors.address && formData.address && (
                    <div className="absolute top-3 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {errors.address && touched.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.address}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formData.address ? formData.address.length : 0}/200 characters
                  </span>
                  {formData.address && formData.address.length > 150 && (
                    <span className="text-xs text-yellow-600">Getting long</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {(formData.companyName || formData.contactPerson) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">
                        {formData.companyName || 'Company Name'}
                      </p>
                    </div>
                    {formData.contactPerson && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Contact:</span> {formData.contactPerson}
                      </p>
                    )}
                    {formData.phone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {formData.phone}
                      </p>
                    )}
                    {formData.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {formData.email}
                      </p>
                    )}
                    {formData.address && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        <span className="font-medium">Address:</span> {formData.address}
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
                className="px-6 py-2.5 text-sm cursor-pointer font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Supplier
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
                <li>• Company name and email must be unique</li>
                <li>• All fields are required</li>
                <li>• Suppliers can be deactivated later if needed</li>
                <li>• Keep contact details up to date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSupplier;