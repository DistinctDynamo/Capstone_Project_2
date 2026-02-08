import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiMenu,
  FiLogOut,
  FiX,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import useAuthStore from '../../store/authStore';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      shortLabel: 'DASH',
      icon: FiHome,
      end: true,
    },
    {
      to: '/admin/pending',
      label: 'Approvals',
      shortLabel: 'APPR',
      icon: FiCheckCircle,
    },
    {
      to: '/admin/teams',
      label: 'Teams',
      shortLabel: 'TEAM',
      icon: GiSoccerBall,
    },
    {
      to: '/admin/users',
      label: 'Users',
      shortLabel: 'USER',
      icon: FiUsers,
    },
    {
      to: '/admin/content',
      label: 'Content',
      shortLabel: 'CONT',
      icon: FiFileText,
    },
  ];

  const getPageTitle = () => {
    const current = navItems.find(
      (item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)
    );
    return current?.label || 'Admin';
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-20 bg-[#0d1219] border-r border-[#1c2430] transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1c2430]">
            <Link to="/admin" className="flex items-center gap-3 lg:justify-center lg:w-full">
              <div className="w-10 h-10 bg-[#1a5f2a] rounded-lg flex items-center justify-center">
                <GiWhistle className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div className="lg:hidden">
                <span className="text-white font-bold text-sm">Soccer</span>
                <span className="text-[#4ade80] font-bold text-sm">Connect</span>
                <p className="text-[8px] text-[#64748b] uppercase tracking-wider">Admin Panel</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-[#64748b] hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                  lg:flex-col lg:gap-1 lg:py-3 lg:px-2
                  ${isActive
                    ? 'bg-[#1a5f2a]/20 text-[#4ade80]'
                    : 'text-[#64748b] hover:text-white hover:bg-[#1c2430]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4ade80] rounded-r lg:w-8 lg:h-1 lg:left-1/2 lg:-translate-x-1/2 lg:top-0 lg:translate-y-0 lg:rounded-b lg:rounded-t-none" />
                    )}
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#4ade80]' : ''}`} />
                    <span className="text-sm font-medium lg:text-[10px] lg:font-bold lg:uppercase lg:tracking-wide">
                      <span className="lg:hidden">{item.label}</span>
                      <span className="hidden lg:inline">{item.shortLabel}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-[#1c2430] p-3">
            {/* User Info (Mobile) */}
            <div className="lg:hidden flex items-center gap-3 p-2 rounded-lg bg-[#141c28] mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#1c2430] flex items-center justify-center text-[#64748b] font-bold text-sm">
                {user?.first_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[#64748b] text-xs">Admin</p>
              </div>
            </div>

            {/* User Avatar (Desktop) */}
            <div className="hidden lg:flex justify-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#1c2430] flex items-center justify-center text-[#64748b] font-bold text-sm">
                {user?.first_name?.[0] || 'A'}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors lg:flex-col lg:gap-1"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-xs font-medium lg:text-[10px] lg:uppercase lg:tracking-wide">
                <span className="lg:hidden">Sign Out</span>
                <span className="hidden lg:inline">Exit</span>
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-[#0d1219] border-b border-[#1c2430] flex items-center justify-between px-4">
          {/* Left: Mobile Menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#64748b] hover:text-white hover:bg-[#1c2430] rounded-lg"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#64748b]">Admin</span>
              <FiChevronRight className="w-3 h-3 text-[#4a5568]" />
              <span className="text-white font-medium">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right: Status + Site Link */}
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[#22c55e] text-xs font-mono uppercase tracking-wider">System Online</span>
            </div>

            {/* View Site */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2430] text-[#94a3b8] hover:text-white transition-colors text-xs"
            >
              <FiExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
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
