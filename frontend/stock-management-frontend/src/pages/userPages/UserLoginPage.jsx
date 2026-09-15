// frontend/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxes,
  FaUniversity,
  FaArrowRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useStock } from '../../context/StockContext';
import axiosInstance from '../../utils/axiosConfig';

const UserLoginPage = () => {
  const { BASIC_URL } = useStock();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasAdmin, setHasAdmin] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get(`${BASIC_URL}/api/auth/check-admin`, {
          withCredentials: true,
        });
        setHasAdmin(response.data.hasAdmin);
      } catch (error) {
        console.error('Error checking admin:', error);
        setHasAdmin(true);
      }
    };
    checkAdmin();
  }, [BASIC_URL]);

  // If user is already logged in, redirect
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const role = parsedUser.role;
        const redirectMap = {
          'Admin': '/admin',
          'Store Manager': '/admin',
          'Department Head': '/user',
          'Staff': '/user'
        };
        navigate(redirectMap[role] || '/');
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  // Validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const allErrors = {};
    ['email', 'password'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error[field]) {
        allErrors[field] = error[field];
      }
    });

    setErrors(allErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(allErrors).length > 0) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/api/auth/login`,
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        },
      );

      if (response.data.success) {
        const { user } = response.data;

        // Store user in localStorage 
        localStorage.setItem('user', JSON.stringify(user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        toast.success(`Welcome back, ${user.fullName}!`);

  
        if (user.role === "Admin") {
          navigate("/admin")
        } else if (user.role === "Store Manager") {
          navigate("/admin")
        } else if (user.role === "Staff") {
         navigate("/user")
        } else if (user.role === "Department Head") {
        navigate("/user")
        }

      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          toast.error(data.message);
          console.log(data.message);
          
        }
      } else {
        toast.error('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaBoxes className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold text-slate-800">
              Astu<span className="text-blue-600">Stock</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Astu Stock Management System
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              <FaUniversity className="mr-1 text-xs" />
              University System
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-semibold text-white text-center">
              Welcome Back
            </h2>
            <p className="text-sm text-blue-100 text-center mt-0.5">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400 text-sm" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="admin@astu.edu.et"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email && touched.email
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  autoComplete="email"
                />
                {touched.email && !errors.email && formData.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                  <FaExclamationCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
           
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400 text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.password && touched.password
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                  <FaExclamationCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Astu Stock Management System
              </p>
              {hasAdmin === false && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ No admin found. Run <code className="bg-amber-100 px-1 py-0.5 rounded">npm run seed:admin</code>
                </p>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UserLoginPage;