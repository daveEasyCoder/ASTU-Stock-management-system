
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import StoreManagerDashboard from './StoreManagerDashboard';


const DashboardRouter = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
        return <Navigate to="/" replace />;
    }

    try {
        const user = JSON.parse(userData);
        const role = user.role;

        if (role === 'Admin') {
            return <AdminDashboard />;
        } else if (role === 'Store Manager') {
            return <StoreManagerDashboard />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    } catch (error) {
        return <Navigate to="/" replace />;
    }
};

export default DashboardRouter;