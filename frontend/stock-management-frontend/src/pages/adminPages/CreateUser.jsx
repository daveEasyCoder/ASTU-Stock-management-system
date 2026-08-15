import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUserTag,
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaRandom
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';

const CreateUser = () => {

  const { BASIC_URL } = useStock();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const location = useLocation();
  const preSelectedDepartmentId = location.state?.departmentId || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Staff',
    department: preSelectedDepartmentId
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [message, setMessage] = useState({
    type: '',
    content: ''
  });
  const roles = [
    { value: 'Admin', label: 'Admin', color: 'purple' },
    { value: 'Store Manager', label: 'Store Manager', color: 'blue' },
    { value: 'Department Head', label: 'Department Head', color: 'green' },
    { value: 'Staff', label: 'Staff', color: 'gray' }
  ];

  // Generate random password function
  const generateRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  };

  // Handle generate password
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword
    }));
    // Clear any password errors
    setErrors(prev => ({
      ...prev,
      password: undefined,
      confirmPassword: undefined
    }));
    // Show success message
    toast.success('Password generated successfully!');
  };

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await axios.get(`${BASIC_URL}/api/departments/get-departments`, {
        });
        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };
    window.scrollTo(0, 0)
    fetchDepartments();
  }, []);

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

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (value.length > 20) {
          newErrors.password = 'Password must be less than 20 characters';
        } else {
          delete newErrors.password;
        }
        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
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
        if (!value && formData.role === 'Department Head') {
          newErrors.department = 'Department is required for Department Head role';
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change if touched
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

  // Handle role change - clear department if not Department Head
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: value,
      department: value === 'Department Head' ? prev.department : ''
    }));
    setTouched(prev => ({
      ...prev,
      role: true
    }));
    validateField('role', value);
  };

  // Validate all fields before submit
  const validateForm = () => {
    const allErrors = {};
    const fields = ['fullName', 'email', 'password', 'confirmPassword', 'phone', 'role'];

    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    // Special validation for department
    if (formData.role === 'Department Head' && !formData.department) {
      allErrors.department = 'Department is required for Department Head';
    }

    setErrors(allErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
      role: true,
      department: formData.role === 'Department Head'
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department || null
      };

      const response = await axios.post(
        `${BASIC_URL}/api/users/create-user`,
        submitData
      );

      if (response.data.success) {
        setMessage({ type: 'success', content: 'User created successfully!' });
        toast.success('User created successfully!');
        // Reset form after successful creation
        setTimeout(() => {
          if (preSelectedDepartmentId) {
             navigate(-1)
          } else {
            handleReset();
          }

        }, 2000);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          setMessage({ type: 'error', content: data.message });
          toast.error(data.message);
          console.log(data.message);
        }
      } else {
        setMessage({ type: 'error', content: 'Failed to create user. Please try again.' });
        toast.error('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'Staff',
      department: ''
    });
    setErrors({});
    setTouched({});
    setGeneratedPassword('');
    setMessage({ type: '', content: '' });
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

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
              <p className="mt-1 text-gray-600">Add a new user to the Astu Stock Management System</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FaUser className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New User</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-semibold text-white">User Information</h2>
            <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new user account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password (min 6 chars)"
                    className={`w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.password && !errors.password
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                      title="Generate random password"
                    >
                      <FaRandom className="w-3 h-3" />
                      <span className="hidden sm:inline">Generate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.password}
                  </p>
                )}
                {generatedPassword && !errors.password && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <FaCheckCircle size={12} />
                    Password generated successfully
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm password"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.confirmPassword && !errors.confirmPassword
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <span className="text-sm text-gray-500">Hide</span>
                    ) : (
                      <span className="text-sm text-gray-500">Show</span>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle size={12} />
                    {errors.confirmPassword}
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
                  Department {formData.role === 'Department Head' && <span className="text-red-500">*</span>}
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
                      } ${loadingDepartments ? 'bg-gray-50' : ''}`}
                  >
                    <option value="">
                      {loadingDepartments ? 'Loading departments...' : 'Select a department'}
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

              </div>
            </div>

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
                className={`px-6 py-2.5 text-sm font-medium cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create User
                  </>
                )}
              </button>
            </div>

            {message && message.content && (
              <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.content}
              </div>
            )}

          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Click the <strong>"Generate"</strong> button to create a random 6-character password</li>
                  <li>Users will be prompted to change their password on first login</li>
                  <li>Department Head role requires a valid department selection</li>
                  <li>Only one active Department Head is allowed per department</li>
                  <li>Users can be assigned to inactive departments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;