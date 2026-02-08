import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiCalendar,
  FiUsers,
  FiGrid,
  FiMessageSquare,
  FiMapPin,
  FiShoppingBag,
  FiChevronDown,
  FiHome,
  FiShield,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/events', label: 'Events', icon: FiCalendar },
    { to: '/teams', label: 'Teams', icon: FiUsers },
    { to: '/players', label: 'Players', icon: FiUser },
    { to: '/classifieds', label: 'Market', icon: FiShoppingBag },
    { to: '/fields', label: 'Fields', icon: FiMapPin },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/team', label: 'My Team', icon: FiUsers },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/account', label: 'Settings', icon: FiSettings },
  ];

  const adminLink = { to: '/admin', label: 'Admin Panel', icon: FiShield };
  const isAdmin = user?.user_type === 'admin';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-[#0d1219]/95 backdrop-blur-xl border-b border-[#1c2430]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#1a5f2a] rounded-lg flex items-center justify-center group-hover:bg-[#22723a] transition-colors">
              <GiSoccerBall className="w-5 h-5 text-[#4ade80]" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">
                Soccer<span className="text-[#4ade80]">Connect</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-[#4ade80]'
                    : 'text-[#94a3b8] hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#4ade80]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1c2430] transition-colors"
                  >
                    <Avatar
                      src={user?.profileImage}
                      name={user?.name}
                      size="sm"
                    />
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-white">
                        {user?.name || 'User'}
                      </p>
                    </div>
                    <FiChevronDown
                      className={`w-4 h-4 text-[#64748b] transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#141c28] border border-[#2a3a4d] rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#2a3a4d] bg-[#1c2430]">
                        <p className="text-sm font-medium text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-[#64748b]">{user?.email}</p>
                      </div>
                      {userLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1c2430] transition-colors"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link
                          to={adminLink.to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4ade80] hover:bg-[#1a5f2a]/20 transition-colors"
                        >
                          <adminLink.icon className="w-4 h-4" />
                          {adminLink.label}
                        </Link>
                      )}
                      <div className="border-t border-[#2a3a4d]">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-[#1a5f2a] text-[#4ade80] hover:bg-[#22723a] rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-[#1c2430] transition-colors"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0d1219] border-t border-[#1c2430]">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated && (
              <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]">
                <Avatar src={user?.profileImage} name={user?.name} size="sm" />
                <div>
                  <p className="font-medium text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-[#64748b]">@{user?.username}</p>
                </div>
              </div>
            )}

            <NavLink
              to="/"
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'text-[#4ade80] bg-[#1a5f2a]/20'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1c2430]'
                }
              `}
            >
              <FiHome className="w-4 h-4" />
              Home
            </NavLink>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-[#4ade80] bg-[#1a5f2a]/20'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#1c2430]'
                  }
                `}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-[#2a3a4d] my-3" />
                {userLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'text-[#4ade80] bg-[#1a5f2a]/20'
                        : 'text-[#94a3b8] hover:text-white hover:bg-[#1c2430]'
                      }
                    `}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to={adminLink.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4ade80] hover:bg-[#1a5f2a]/20 transition-colors"
                  >
                    <adminLink.icon className="w-4 h-4" />
                    {adminLink.label}
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-4 space-y-2 border-t border-[#2a3a4d] mt-3">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium text-[#94a3b8] bg-[#1c2430] hover:bg-[#2a3a4d] rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium bg-[#1a5f2a] text-[#4ade80] hover:bg-[#22723a] rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
