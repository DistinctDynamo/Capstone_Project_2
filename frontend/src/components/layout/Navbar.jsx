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
import { GiSoccerBall } from 'react-icons/gi';
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
    { to: '/classifieds', label: 'Classifieds', icon: FiShoppingBag },
    { to: '/fields', label: 'Fields', icon: FiMapPin },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/team', label: 'My Team', icon: FiUsers },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/account', label: 'Account Settings', icon: FiSettings },
  ];

  // Admin link for admin users
  const adminLink = { to: '/admin', label: 'Admin Panel', icon: FiShield };
  const isAdmin = user?.user_type === 'admin';

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${
          isScrolled || !isHomePage
            ? 'bg-dark-900/95 backdrop-blur-xl border-b border-dark-800 shadow-lg'
            : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow group-hover:shadow-glow transition-shadow">
              <GiSoccerBall className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              Soccer<span className="text-primary-400">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }
                `}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-800 transition-colors"
                >
                  <Avatar
                    src={user?.profileImage}
                    name={user?.name}
                    size="sm"
                    showStatus
                    status="online"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-dark-400">
                      @{user?.username || 'username'}
                    </p>
                  </div>
                  <FiChevronDown
                    className={`w-4 h-4 text-dark-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 py-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl animate-slide-up">
                    <div className="px-4 py-3 border-b border-dark-700">
                      <p className="text-sm font-medium text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-dark-400">{user?.email}</p>
                    </div>
                    {userLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        to={adminLink.to}
                        className="flex items-center gap-3 px-4 py-2.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 transition-colors"
                      >
                        <adminLink.icon className="w-4 h-4" />
                        {adminLink.label}
                      </Link>
                    )}
                    <div className="border-t border-dark-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors"
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
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-dark-900 border-t border-dark-800 animate-slide-up">
          <div className="px-4 py-6 space-y-2">
            {isAuthenticated && (
              <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-dark-800 rounded-xl">
                <Avatar
                  src={user?.profileImage}
                  name={user?.name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-dark-400">@{user?.username}</p>
                </div>
              </div>
            )}

            <NavLink
              to="/"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                transition-colors
                ${
                  isActive
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }
              `}
            >
              <FiHome className="w-5 h-5" />
              Home
            </NavLink>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                  transition-colors
                  ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }
                `}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-dark-700 my-4" />
                {userLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                      transition-colors
                      ${
                        isActive
                          ? 'text-primary-400 bg-primary-500/10'
                          : 'text-dark-300 hover:text-white hover:bg-dark-800'
                      }
                    `}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to={adminLink.to}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                      transition-colors
                      ${
                        isActive
                          ? 'text-primary-400 bg-primary-500/10'
                          : 'text-primary-400 hover:text-primary-300 hover:bg-dark-800'
                      }
                    `}
                  >
                    <adminLink.icon className="w-5 h-5" />
                    {adminLink.label}
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-dark-800 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-4 space-y-3">
                <Link to="/login" className="btn-secondary w-full">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary w-full">
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
