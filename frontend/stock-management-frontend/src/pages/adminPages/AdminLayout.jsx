import React, { useEffect } from 'react'
import { useState } from 'react'
import {
    FaBoxes,
    FaTags,
    FaUsers,
    FaChartLine,
    FaSignOutAlt,
    FaChevronDown,
    FaChevronRight,
    FaUniversity,
    FaHandshake,
    FaShoppingCart
} from 'react-icons/fa'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { X, Menu, LayoutDashboard, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import axiosInstance from '../../utils/axiosConfig'
import { toast } from 'react-toastify'

const AdminLayout = () => {
    const [activeLink, setActiveLink] = useState(0);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                setUser(null);
            }
        }
    }, []);

    // Professional blue color palette
    const colors = {
        primary: '#1a56db',      // Deep professional blue
        primaryLight: '#3b82f6', // Lighter blue
        primaryDark: '#1e3a8a',  // Dark blue
        primaryHover: '#2563eb', // Hover blue
        primaryBg: '#eff6ff',    // Very light blue background
        sidebarBg: '#0f172a',    // Dark navy sidebar
        sidebarHover: '#1e293b', // Hover state
        textLight: '#94a3b8',    // Muted text
        textWhite: '#f8fafc',    // White text
        borderColor: '#1e293b',  // Border color
        activeBg: '#1e3a8a',     // Active background
    }

    const sidebar = [{
        title: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        to: "/admin",
        isSingle: true,
        roles: ['Admin', 'Store Manager']
    }, {
        title: "User Management",
        icon: <FaUsers className="w-5 h-5" />,
        children: [{
            subTitle: 'Create User',
            to: 'create-user'
        }, {
            subTitle: 'User List',
            to: 'user-list'
        }],
        roles: ['Admin']
    }, {
        title: "Category Management",
        icon: <FaTags className="w-5 h-5" />,
        children: [{
            subTitle: 'Create Category',
            to: 'create-category'
        }, {
            subTitle: 'Category List',
            to: 'category-list'
        }],
        roles: ['Admin', 'Store Manager']
    }, {
        title: "Dep Management",
        icon: <FaUniversity className="w-5 h-5" />,
        children: [{
            subTitle: 'Create Department',
            to: 'create-department'
        }, {
            subTitle: 'Department List',
            to: 'department-list'
        }],
        roles: ['Admin']
    }, {
        title: "Supplier Management",
        icon: <FaHandshake className="w-5 h-5" />,
        children: [{
            subTitle: 'Create Supplier',
            to: 'create-supplier'
        }, {
            subTitle: 'Supplier List',
            to: 'supplier-list'
        }],
        roles: ['Admin', 'Store Manager']
    },
    {
        title: "Item Management",
        icon: <FaBoxes className="w-5 h-5" />,
        children: [{
            subTitle: 'Create Item',
            to: 'create-item'
        }, {
            subTitle: 'Item List',
            to: 'item-list'
        }],
        roles: ['Admin', 'Store Manager']
    },
    {
        title: "Purchase Management",
        icon: <FaShoppingCart className="w-5 h-5" />,
        children: [{
            subTitle: 'Create Purchase',
            to: 'create-purchase'
        }, {
            subTitle: 'Purchase List',
            to: 'purchase-list'
        }],
        roles: ['Admin', 'Store Manager']
    }, {
        title: "Reports",
        icon: <FaChartLine className="w-5 h-5" />,
        children: [{
            subTitle: 'Stock Report',
            to: 'stock-report'
        }, {
            subTitle: 'Sales Report',
            to: 'sales-report'
        }],
        roles: ['Admin', 'Store Manager']
    }]

    const userRole = user?.role;


    const filteredSidebar = sidebar.filter(item => {
        // If no roles defined, show to everyone (fallback)
        if (!item.roles) return true;
        return item.roles.includes(userRole);
    });
    const [activeIndex, setActiveIndex] = useState([])

    const handleShowChildren = index => {
        setActiveIndex(activeIndex.includes(index)
            ? activeIndex.filter(active => active !== index)
            : [...activeIndex, index])
    }

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await axiosInstance.post(`/api/auth/logout`, {});
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, clear local data
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    // Check if a link is active
    const isLinkActive = (to) => {
        return location.pathname.includes(to)
    }

    // Check if any child is active
    const isChildActive = (children) => {
        if (!children) return false
        return children.some(child => location.pathname.includes(child.to))
    }

    return (
        <>
            {/* Sidebar */}
            <div
                className={`h-screen fixed top-0 left-0 z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
                    }
                bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl overflow-hidden`}
                style={{ backgroundColor: colors.sidebarBg }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Header */}
                    <div className={`flex items-center justify-between px-4 py-5 border-b border-slate-700 ${isCollapsed ? 'flex-col gap-3' : ''
                        }`}>
                        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30">
                                <FaBoxes className="text-white w-5 h-5" />
                            </div>
                            {!isCollapsed && (
                                <span className="text-xl font-bold text-white tracking-tight">
                                    Astu<span className="text-blue-400">Stock</span>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                            {isCollapsed ? <ChevronRightIcon size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <button
                            onClick={() => setIsSidebarVisible(false)}
                            className="sm:hidden text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                        {filteredSidebar.map((side, index) => (
                            <div key={index} className="mb-1">
                                {side.isSingle ? (
                                    // Single link (Dashboard)
                                    <Link
                                        to={side.to}
                                        onClick={() => {
                                            setActiveLink(index)
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${location.pathname === side.to
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                        title={isCollapsed ? side.title : ''}
                                    >
                                        <span className="text-xl">{side.icon}</span>
                                        {!isCollapsed && <span className="text-sm font-medium">{side.title}</span>}
                                    </Link>
                                ) : (
                                    // Dropdown links
                                    <>
                                        <button
                                            onClick={() => handleShowChildren(index)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isChildActive(side.children)
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                } ${isCollapsed ? 'justify-center' : ''}`}
                                            title={isCollapsed ? side.title : ''}
                                        >
                                            <span className="text-xl">{side.icon}</span>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="text-sm font-medium flex-1 text-left">{side.title}</span>
                                                    <span className="text-xs">
                                                        {activeIndex.includes(index) ? <FaChevronDown /> : <FaChevronRight />}
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                        {!isCollapsed && activeIndex.includes(index) && (
                                            <div className="mt-1 ml-4 pl-2 border-l-2 border-blue-500/30 space-y-1">
                                                {side.children.map((child, i) => (
                                                    <Link
                                                        key={i}
                                                        to={child.to}
                                                        onClick={() => setIsSidebarVisible(false)}
                                                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${location.pathname.includes(child.to)
                                                            ? 'text-blue-400 bg-blue-500/10 font-medium'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-slate-700 pt-4 pb-6 px-3">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''
                                }`}
                            title={isCollapsed ? 'Logout' : ''}
                        >
                            <FaSignOutAlt className="text-xl" />
                            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div
                className={`fixed top-0 right-0 z-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'left-20' : 'left-64'
                    } ${isSidebarVisible ? '' : 'left-0'}`}
            >
                <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarVisible(true)}
                            className="sm:hidden text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                                D
                            </div>
                            <div className="hidden sm:block">
                                {user && user?.fullName && <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>}
                                {user && user?.email && <p className="text-gray-500 text-xs">{user.email}</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm shadow-blue-500/25 transition-all duration-200 hover:shadow-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
                    } ${!isSidebarVisible ? 'ml-0' : ''} mt-16 p-6 bg-gray-50 min-h-screen`}
            >
                <Outlet />
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </>
    )
}

export default AdminLayout