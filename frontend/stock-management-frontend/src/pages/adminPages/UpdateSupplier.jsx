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
    FaBuilding,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTruck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';
import axiosInstance from '../../utils/axiosConfig';

const UpdateSupplier = () => {
    const { BASIC_URL } = useStock();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        isActive: true
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Fetch supplier data
    useEffect(() => {
        const fetchSupplier = async () => {
            setFetching(true);
            try {
                const response = await axiosInstance.get(`/api/suppliers/get-supplier/${id}`);

                if (response.data.success) {
                    const supplier = response.data.supplier;
                    setFormData({
                        companyName: supplier.companyName || '',
                        contactPerson: supplier.contactPerson || '',
                        phone: supplier.phone || '',
                        email: supplier.email || '',
                        address: supplier.address || '',
                        isActive: supplier.isActive !== undefined ? supplier.isActive : true
                    });
                    setOriginalData({
                        companyName: supplier.companyName || '',
                        contactPerson: supplier.contactPerson || '',
                        phone: supplier.phone || '',
                        email: supplier.email || '',
                        address: supplier.address || '',
                        isActive: supplier.isActive !== undefined ? supplier.isActive : true
                    });
                }
            } catch (error) {
                console.error('Error fetching supplier:', error);
                toast.error('Failed to load supplier data');
                navigate('/admin/supplier-list');
            } finally {
                setFetching(false);
            }
        };

        window.scrollTo(0,0)
        fetchSupplier();
    }, [id, BASIC_URL, navigate]);

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

    // Check if form has changes
    const hasChanges = () => {
        return (
            formData.companyName !== originalData.companyName ||
            formData.contactPerson !== originalData.contactPerson ||
            formData.phone !== originalData.phone ||
            formData.email !== originalData.email ||
            formData.address !== originalData.address ||
            formData.isActive !== originalData.isActive
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

            if (formData.companyName !== originalData.companyName) {
                submitData.companyName = formData.companyName.trim();
            }

            if (formData.contactPerson !== originalData.contactPerson) {
                submitData.contactPerson = formData.contactPerson.trim();
            }

            if (formData.phone !== originalData.phone) {
                submitData.phone = formData.phone.trim();
            }

            if (formData.email !== originalData.email) {
                submitData.email = formData.email.trim().toLowerCase();
            }

            if (formData.address !== originalData.address) {
                submitData.address = formData.address.trim();
            }

            if (formData.isActive !== originalData.isActive) {
                submitData.isActive = formData.isActive;
            }

            const response = await axiosInstance.put(
                `/api/suppliers/update-supplier/${id}`,
                submitData
            );

            if (response.data.success) {
                toast.success('Supplier updated successfully!');
                setTimeout(() => {
                    navigate('/admin/supplier-list');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            if (error.response) {
                const { data } = error.response;
                if (data.message) {
                    toast.error(data.message);
                }
            } else {
                toast.error('Failed to update supplier. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setFormData({
            companyName: originalData.companyName,
            contactPerson: originalData.contactPerson,
            phone: originalData.phone,
            email: originalData.email,
            address: originalData.address,
            isActive: originalData.isActive
        });
        setErrors({});
        setTouched({});
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading supplier data...</p>
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
                        onClick={() => navigate('/admin/supplier-list')}
                        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Supplier List
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
                            <p className="mt-1 text-gray-600">Update supplier information and settings</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                                <FaTruck className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">Edit Supplier</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Supplier Information</h2>
                                <p className="text-sm text-blue-100 mt-1">Update the details for this supplier</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${formData.isActive
                                        ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                                        : 'bg-red-500/20 text-red-100 border border-red-400/30'
                                    }`}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
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

                        {/* Status Toggle */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Supplier Status
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.isActive
                                            ? 'Supplier is active and available for transactions'
                                            : 'Supplier is inactive and hidden from selection'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        {(formData.companyName || formData.contactPerson) && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.isActive ? 'bg-blue-100' : 'bg-gray-200'
                                        }`}>
                                        <FaTruck className={formData.isActive ? 'text-blue-600' : 'text-gray-500'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className={`font-medium ${formData.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {formData.companyName || 'Company Name'}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {formData.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {formData.contactPerson && (
                                            <p className={`text-sm ${formData.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                                <span className="font-medium">Contact:</span> {formData.contactPerson}
                                            </p>
                                        )}
                                        {formData.phone && (
                                            <p className={`text-sm ${formData.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                                <span className="font-medium">Phone:</span> {formData.phone}
                                            </p>
                                        )}
                                        {formData.address && (
                                            <p className={`text-sm ${formData.isActive ? 'text-gray-600' : 'text-gray-400'} line-clamp-1`}>
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
                                type="button"
                                onClick={() => navigate('/admin/supplier-list')}
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
                                        Update Supplier
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
                                    <li>Company name and email must be unique</li>
                                    <li>All fields are required</li>
                                    <li>Inactive suppliers will be hidden from selection</li>
                                    <li>Contact details should be kept up to date</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateSupplier;