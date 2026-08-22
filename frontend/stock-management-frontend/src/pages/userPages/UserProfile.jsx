// pages/UserProfile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaUserTag,
    FaCamera,
    FaTrash,
    FaSave,
    FaTimes,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle,
    FaLock,
    FaKey,
    FaEdit,
    FaArrowLeft,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const UserProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
                setFormData({
                    fullName: response.data.user.fullName || '',
                    phone: response.data.user.phone || '',
                });
                if (response.data.user.profileImage) {
                    const baseUrl = 'http://localhost:4000';
                    setImagePreview(`${baseUrl}/uploads/profiles/${response.data.user.profileImage}`);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image
    const handleRemoveImage = async () => {
        if (!window.confirm('Are you sure you want to remove your profile image?')) return;

        try {
            const response = await axiosInstance.delete('/profile/remove-image');
            if (response.data.success) {
                setUser(response.data.user);
                setImagePreview(null);
                setImageFile(null);
                toast.success('Profile image removed');
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image');
        }
    };

    // Save profile
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const submitData = new FormData();
            if (formData.fullName !== user?.fullName) {
                submitData.append('fullName', formData.fullName);
            }
            if (formData.phone !== user?.phone) {
                submitData.append('phone', formData.phone);
            }
            if (imageFile) {
                submitData.append('profileImage', imageFile);
            }

            const response = await axiosInstance.put('/api/profile/update-profile', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setUser(response.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
                // Update localStorage user data
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirmation do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axiosInstance.put('/api/profile/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });

            if (response.data.success) {
                toast.success('Password changed successfully');
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                    <p className="text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group text-sm"
                    >
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FaUser className="text-blue-600" />
                                My Profile
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                View and manage your personal information
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isEditing
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isEditing ? <FaTimes /> : <FaEdit />}
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FaKey />
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                        <p className="text-sm text-blue-100 mt-0.5">Your personal details</p>
                    </div>

                    <div className="p-6">
                        {/* Avatar & Image Upload */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-200">
                            <div className="relative group">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                                        />
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition-colors"
                                            >
                                                <FaCamera className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute top-0 right-0 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-colors"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {getInitials(user?.fullName)}
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition-colors"
                                            >
                                                <FaCamera className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{user?.fullName}</h3>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                        <FaUserTag className="mr-1" />
                                        {user?.role}
                                    </span>
                                    {user?.department && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                                            <FaBuilding className="mr-1" />
                                            {user.department.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${!isEditing
                                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                                    : 'border-slate-300 focus:ring-blue-500'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-slate-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${!isEditing
                                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                                    : 'border-slate-300 focus:ring-blue-500'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Role (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Role
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUserTag className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={user?.role || ''}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Department (Read-only) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBuilding className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={user?.department?.name || 'Not Assigned'}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            {isEditing && (
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-amber-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Change Password</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Enter your current password and choose a new one
                            </p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Enter new password (min 6 chars)"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCheckCircle className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {passwordLoading ? (
                                        <><FaSpinner className="animate-spin" /> Changing...</>
                                    ) : (
                                        <><FaKey /> Change Password</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserProfile;