import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <FaExclamationTriangle className="text-amber-500 text-6xl mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-600 mb-6">
                    You don't have permission to access this page.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;