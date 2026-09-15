import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
    baseURL: 'https://stock-management-system-voxc.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor – handles 401 and 403 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'An error occurred';

        // --- 401 Unauthorized (Not logged in or invalid token) ---
        if (status === 401) {
            localStorage.removeItem('user');    

            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
            return Promise.reject(error);
        }

        // --- 403 Forbidden (Authenticated but not allowed) ---
        if (status === 403) {
            toast.error(message);
            // if (window.location.pathname !== '/unauthorized') {
            //     window.location.href = '/unauthorized';
            // }

            return Promise.reject(error);
        }


        toast.error(message);
        return Promise.reject(error);
    }
);

export default axiosInstance;