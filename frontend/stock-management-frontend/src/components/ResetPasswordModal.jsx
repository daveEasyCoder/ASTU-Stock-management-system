// components/ResetPasswordModal.jsx

import React, { useState } from 'react';
import { FaKey, FaSpinner, FaCheckCircle, FaTimes, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ResetPasswordModal = ({ isOpen, onClose, userId, userName, onReset }) => {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${BASIC_URL}/users/reset-password/${userId}`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setNewPassword(response.data.temporaryPassword);
                alert('Password reset successfully. New password: ' + response.data.temporaryPassword);
                onReset && onReset(response.data.temporaryPassword);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword);
        setCopied(true);
        toast.success('Password copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <FaKey className="text-yellow-600 text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Reset Password</h3>
                            <p className="text-sm text-gray-500">for {userName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {!newPassword ? (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                This will generate a new temporary password for <strong>{userName}</strong>.
                                The user will be required to change their password upon next login.
                            </p>
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800 flex items-start gap-2">
                                    <span className="font-bold">⚠️</span>
                                    <span>
                                        The current password will be invalidated. The user will receive an email with the new password.
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <><FaSpinner className="animate-spin" /> Resetting...</>
                                ) : (
                                    <><FaKey /> Reset Password</>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                                <p className="text-green-800 flex items-center gap-2">
                                    <FaCheckCircle className="text-green-600" />
                                    Password reset successfully!
                                </p>
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temporary Password
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newPassword}
                                    readOnly
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg text-center"
                                />
                                <button
                                    onClick={handleCopyPassword}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <FaCopy />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Share this password with the user. They must change it after first login.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordModal;