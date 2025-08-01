import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  MapPin,
  HeadphonesIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Menu Items', href: '/dashboard/menu-items', icon: ChefHat },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Branches', href: '/dashboard/branches', icon: MapPin },
    { name: 'Loyalty Config', href: '/dashboard/loyalty-config', icon: Settings },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/image.png" alt="VOYA" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:via-[#E85A9B]/10 hover:to-[#D946EF]/10 hover:text-[#E6A85C]'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <img src="/image.png" alt="VOYA" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-400 hover:text-[#E6A85C] hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:to-[#E85A9B]/10 rounded-lg transition-all duration-300"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:via-[#E85A9B]/10 hover:to-[#D946EF]/10 hover:text-[#E6A85C]'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} ${
                    isActive(item.href) ? '' : 'group-hover:scale-110'
                  } transition-transform duration-300`} />
                  {!sidebarCollapsed && item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-[#E6A85C] transition-colors duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:via-[#E85A9B]/10 hover:to-[#D946EF]/10 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#E6A85C] transition-colors duration-300">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Restaurant Owner</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-[#E6A85C] transition-all duration-300 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.email}
                          </p>
                          <p className="text-xs text-gray-500">Restaurant Owner</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {userDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserDropdownOpen(false)}
        />
      )}
    </div>
  );
}