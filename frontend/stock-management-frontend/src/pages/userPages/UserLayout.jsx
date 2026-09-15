// layouts/UserLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  FaHome,
  FaBoxes,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaChartBar,
  FaBell,
} from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = user?.role || 'Staff';

  // Get user initials
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if link is active
  const isActive = (path) => {
    if (path === '/user') {
      return location.pathname === '/user';
    }
    return location.pathname.includes(path);
  };

  // Toggle dropdown
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout', {});
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
       // Even if API fails, clear local data
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  // --- Sidebar Configuration ---

  // Common items for both Staff and Department Head
  const sidebarConfig = {
    Staff: [
      {
        title: 'Dashboard',
        icon: <FaHome className="w-5 h-5" />,
        path: '/user/staff-dashboard',
        isSingle: true,
      },
      {
        title: 'Stock Requests',
        icon: <FaClipboardList className="w-5 h-5" />,
        children: [
          { subTitle: 'Create Request', to: 'create-stock-request' },
          { subTitle: 'My Requests', to: 'my-requests' },
        ],
      },
      {
        title: 'Available Items',
        icon: <FaBoxes className="w-5 h-5" />,
        path: '/user/items',
        isSingle: true,
      },
      {
        title: 'Profile',
        icon: <FaUser className="w-5 h-5" />,
        path: '/user/profile',
        isSingle: true,
      },
    ],
    'Department Head': [
      {
        title: 'Dashboard',
        icon: <FaHome className="w-5 h-5" />,
        path: '/user/dashboard',
        isSingle: true,
      },
      {
        title: 'Stock Requests',
        icon: <FaClipboardList className="w-5 h-5" />,
        children: [
          { subTitle: 'Create Request', to: 'create-stock-request' },
           { subTitle: 'My Requests', to: 'my-requests' },
          { subTitle: 'Pending Approvals', to: 'pending-approvals' },
          { subTitle: 'Department Requests', to: 'department-requests' },
        ],
      },
      {
        title: 'Available Items',
        icon: <FaBoxes className="w-5 h-5" />,
        path: '/user/items',
        isSingle: true,
      },
      {
        title: 'Department Report',
        icon: <FaChartBar className="w-5 h-5" />,
        path: '/user/department-report',
        isSingle: true,
      },
      {
        title: 'Profile',
        icon: <FaUser className="w-5 h-5" />,
        path: '/user/profile',
        isSingle: true,
      },
    ],
  };

  // Get sidebar items based on role
  const sidebarItems = sidebarConfig[userRole] || sidebarConfig.Staff;

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on mobile when navigating
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-72' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <Link to="/user/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/25">
              <FaBoxes className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-800">
              Astu<span className="text-blue-600">Stock</span>
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 md:hidden"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
              {user ? getInitials(user.fullName) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || ''}
              </p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {sidebarItems.map((item, index) => (
            <div key={index} className="mb-1">
              {item.isSingle ? (
                // Single link
                <Link
                  to={item.path}
                  onClick={() => {
                    handleNavigation();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              ) : (
                // Dropdown
                <>
                  <button
                    onClick={() => toggleDropdown(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      item.children.some((child) =>
                        location.pathname.includes(child.to)
                      )
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.title}
                    </span>
                    <span className="text-xs">
                      {activeDropdown === index ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </span>
                  </button>

                  {activeDropdown === index && (
                    <div className="mt-1 ml-4 pl-2 border-l-2 border-blue-200 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={`/user/${child.to}`}
                          onClick={() => {
                            handleNavigation();
                          }}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            location.pathname.includes(child.to)
                              ? 'text-blue-600 bg-blue-50 font-medium'
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {child.subTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom - Logout */}
        <div className="px-3 py-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <HiMenu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-slate-800">
                  {location.pathname
                    .split('/')
                    .pop()
                    ?.replace(/-/g, ' ')
                    .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()) || 'Dashboard'}
                </h2>
                <p className="text-xs text-slate-500">
                  {userRole === 'Department Head' ? 'Department Head' : 'Staff'} Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications (placeholder) */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <FaBell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Info (mobile) */}
              <div className="flex items-center gap-2 sm:hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                  {user ? getInitials(user.fullName) : 'U'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
              >
                <FaSignOutAlt className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default UserLayout;