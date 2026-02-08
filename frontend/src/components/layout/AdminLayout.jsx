import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiShield,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
    { to: '/admin/pending', label: 'Pending Approvals', icon: FiCheckCircle },
    { to: '/admin/users', label: 'User Management', icon: FiUsers },
    { to: '/admin/content', label: 'Content Moderation', icon: FiFileText },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 bg-dark-900 border-r border-dark-800
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <GiSoccerBall className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-display font-bold text-white">
                  Soccer<span className="text-primary-400">Connect</span>
                </span>
                <div className="flex items-center gap-1 text-xs text-primary-400">
                  <FiShield className="w-3 h-3" />
                  Admin Panel
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-dark-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-3">
              <Avatar
                src={user?.profileImage}
                name={user?.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-primary-400">Administrator</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
                Back to App
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">Admin Panel</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
