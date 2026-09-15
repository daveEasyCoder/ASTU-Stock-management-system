

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const role = user.role;

                // Redirect based on role
                if (role === 'Department Head') {
                    navigate('/user/dashboard');
                } else if (role === 'Staff') {
                    navigate('/user/staff-dashboard');
                } else {
                    navigate('/user/items'); // Fallback
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/user/items');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-slate-600">Redirecting...</p>
            </div>
        </div>
    );
};

export default UserRedirect;