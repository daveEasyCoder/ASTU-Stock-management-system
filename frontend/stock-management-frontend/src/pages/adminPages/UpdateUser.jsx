import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaUserTag,
    FaBuilding,
    FaArrowLeft,
    FaSave,
    FaTimes,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle,
    FaCamera,
    FaUpload,
    FaTrash,
    FaImage
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStock } from '../../context/StockContext';
import axiosInstance from '../../utils/axiosConfig';

const UpdateUser = () => {
    const { BASIC_URL } = useStock();
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        isActive: true
    });

    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState({});

    const roles = [
        { value: 'Admin', label: 'Admin', color: 'purple' },
        { value: 'Store Manager', label: 'Store Manager', color: 'blue' },
        { value: 'Department Head', label: 'Department Head', color: 'green' },
        { value: 'Staff', label: 'Staff', color: 'gray' }
    ];

    // Fetch user data and departments
    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                // Fetch user details
                const userResponse = await axiosInstance.get(`/api/users/get-user/${id}`);

                if (userResponse.data.success) {
                    const user = userResponse.data.user;
                    setFormData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        role: user.role || 'Staff',
                        department: user.department?._id || '',
                        isActive: user.isActive !== undefined ? user.isActive : true
                    });
                    setOriginalData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        role: user.role || 'Staff',
                        department: user.department?._id || '',
                        isActive: user.isActive !== undefined ? user.isActive : true
                    });
                    if (user.profileImage) {
                        setProfileImagePreview(`${BASIC_URL}/uploads/profiles/${user.profileImage}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Failed to load user data');
                navigate('/admin/user-list');
            }

            // Fetch departments
            try {
                const deptResponse = await axiosInstance.get(`/api/departments/get-departments`);
                if (deptResponse.data.success) {
                    setDepartments(deptResponse.data.departments);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                toast.error('Failed to load departments');
            }

            setFetching(false);
        };

        fetchData();
    }, [id, BASIC_URL, navigate]);

    // Validation function
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'fullName':
                if (!value || value.trim().length < 2) {
                    newErrors.fullName = 'Full name must be at least 2 characters';
                } else if (value.trim().length > 50) {
                    newErrors.fullName = 'Full name must be less than 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    newErrors.fullName = 'Full name should only contain letters and spaces';
                } else {
                    delete newErrors.fullName;
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

            case 'phone':
                const phoneRegex = /^[0-9]{10}$/;
                if (!value) {
                    newErrors.phone = 'Phone number is required';
                } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    newErrors.phone = 'Please enter a valid 10-digit phone number';
                } else {
                    delete newErrors.phone;
                }
                break;

            case 'role':
                if (!value) {
                    newErrors.role = 'Role is required';
                } else {
                    delete newErrors.role;
                }
                break;

            case 'department':
                if (!value && (formData.role === 'Department Head' || formData.role === 'Staff' || formData.role === 'Store Manager')) {
                    newErrors.department = `${formData.role} must belong to a department`;
                } else {
                    delete newErrors.department;
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

    // Handle role change - clear department if not required
    const handleRoleChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            role: value,
        }));
        setTouched(prev => ({
            ...prev,
            role: true
        }));
        validateField('role', value);
    };

    // Handle profile image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
                toast.error('Please upload a valid image (JPEG, PNG, WebP)');
                return;
            }

            setProfileImageFile(file);
            setRemoveImage(false);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle remove image
    const handleRemoveImage = () => {
        setProfileImageFile(null);
        setProfileImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Validate all fields before submit
    const validateForm = () => {
        const allErrors = {};
        const fields = ['fullName', 'email', 'phone', 'role'];

        fields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error[field]) {
                allErrors[field] = error[field];
            }
        });

        // Special validation for department
        if ((formData.role === 'Department Head' || formData.role === 'Staff' || formData.role === 'Store Manager') && !formData.department) {
            allErrors.department = `${formData.role} must belong to a department`;
        }

        setErrors(allErrors);
        setTouched({
            fullName: true,
            email: true,
            phone: true,
            role: true,
            department: true
        });

        return Object.keys(allErrors).length === 0;
    };

    // Check if form has changes
    const hasChanges = () => {
        const changed =
            formData.fullName !== originalData.fullName ||
            formData.email !== originalData.email ||
            formData.phone !== originalData.phone ||
            formData.role !== originalData.role ||
            formData.department !== originalData.department ||
            formData.isActive !== originalData.isActive ||
            profileImageFile !== null ||
            removeImage;
        return changed;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
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

            if (formData.fullName !== originalData.fullName) {
                submitData.append('fullName', formData.fullName.trim());
            }

            if (formData.email !== originalData.email) {
                submitData.append('email', formData.email.trim().toLowerCase());
            }

            if (formData.phone !== originalData.phone) {
                submitData.append('phone', formData.phone.trim());
            }

            if (formData.role !== originalData.role) {
                submitData.append('role', formData.role);
            }

            if (formData.department !== originalData.department) {
                submitData.append('department', formData.department || '');
            }

            if (formData.isActive !== originalData.isActive) {
                submitData.append('isActive', formData.isActive);
            }

            if (profileImageFile) {
                submitData.append('profileImage', profileImageFile);
            }

            if (removeImage && !profileImageFile) {
                submitData.append('profileImage', '');
            }


            const response = await axiosInstance.put(
                `/api/users/update-user/${id}`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success('User updated successfully!');
                // setTimeout(() => {
                //   navigate(`/admin/user-detail/${id}`);
                // }, 1500);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.response) {
                const { data } = error.response;
                if (data.message) {
                    setMessage(data.message);
                }
            } else {
                setMessage('Failed to update user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Get role color
    const getRoleColor = (role) => {
        const roleColors = {
            'Admin': 'purple',
            'Store Manager': 'blue',
            'Department Head': 'green',
            'Staff': 'gray'
        };
        return roleColors[role] || 'gray';
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(`/admin/user-detail/${id}`)}
                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to User Details
                        </button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                                <p className="mt-1 text-gray-600">Update user information and settings</p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                                    <FaUser className="text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">Edit User</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700">
                            <h2 className="text-lg font-semibold text-white">Edit User Information</h2>
                            <p className="text-sm text-blue-100 mt-1">Update the details for this user account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Profile Image Upload */}
                            <div className="border-b border-gray-200 pb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Profile Image
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        {profileImagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={profileImagePreview}
                                                    alt="Profile preview"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                                                >
                                                    <FaTimes className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <FaUser className="text-gray-400 text-3xl" />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter full name"
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.fullName && touched.fullName
                                                ? 'border-red-500 focus:ring-red-500'
                                                : touched.fullName && !errors.fullName
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                        />
                                        {touched.fullName && !errors.fullName && formData.fullName && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <FaCheckCircle className="text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.fullName && touched.fullName && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <FaExclamationCircle size={12} />
                                            {errors.fullName}
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
                                                : touched.email && !errors.email
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
                                                : touched.phone && !errors.phone
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

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUserTag className="text-gray-400" />
                                        </div>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleRoleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.role && touched.role
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                        >
                                            {roles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.role && touched.role && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <FaExclamationCircle size={12} />
                                            {errors.role}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(formData.role)}-100 text-${getRoleColor(formData.role)}-700`}>
                                            Selected: {formData.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department {(formData.role === 'Department Head' || formData.role === 'Staff' || formData.role === 'Store Manager') && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBuilding className="text-gray-400" />
                                        </div>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={loadingDepartments}
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.department && touched.department
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                                } ${(loadingDepartments) ? 'bg-gray-50' : ''}`}
                                        >
                                            <option value="">
                                                {loadingDepartments
                                                    ? 'Loading departments...'
                                                    : 'Select a department'}
                                            </option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept._id}>
                                                    {dept.name} {!dept.isActive ? '(Inactive)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.department && touched.department && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <FaExclamationCircle size={12} />
                                            {errors.department}
                                        </p>
                                    )}
                                    {formData.role === 'Admin' && (
                                        <p className="mt-1 text-xs text-blue-600">
                                            <FaExclamationCircle className="inline mr-1" size={12} />
                                            An admin user does not necessarily need a department
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isActive"
                                                value="true"
                                                checked={formData.isActive === true}
                                                onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isActive"
                                                value="false"
                                                checked={formData.isActive === false}
                                                onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-gray-700">Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/user-detail/${id}`)}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <FaTimes />
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
                                            Update User
                                        </>
                                    )}
                                </button>
                            </div>

                            {message && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700 flex items-center gap-2">
                                        <FaExclamationCircle />
                                        {message}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Important Notes */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="shrink-0">
                                <FaExclamationCircle className="text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
                                <div className="mt-1 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Department Heads, Store Managers, and Staff must belong to a department</li>
                                        <li>Only one active Department Head is allowed per department</li>
                                        <li>Changing email or phone will check for duplicates</li>
                                        <li>Profile image must be less than 5MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateUser;