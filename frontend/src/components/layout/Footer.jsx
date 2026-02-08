import { Link } from 'react-router-dom';
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiFacebook,
  FiTwitter,
  FiInstagram,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Events', to: '/events' },
      { label: 'Teams', to: '/teams' },
      { label: 'Classifieds', to: '/classifieds' },
      { label: 'Fields', to: '/fields' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
    ],
    legal: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <GiSoccerBall className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Soccer<span className="text-primary-400">Connect</span>
              </span>
            </Link>
            <p className="text-dark-400 mb-6 max-w-sm">
              Connecting the GTA soccer community. Find pickup games, join teams,
              discover local fields, and connect with fellow players.
            </p>
            <div className="space-y-3 text-dark-400">
              <div className="flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-primary-500" />
                <span>Greater Toronto Area, Canada</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-primary-500" />
                <a
                  href="mailto:hello@soccerconnect.ca"
                  className="hover:text-primary-400 transition-colors"
                >
                  hello@soccerconnect.ca
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-primary-500" />
                <a
                  href="tel:+14165551234"
                  className="hover:text-primary-400 transition-colors"
                >
                  (416) 555-1234
                </a>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-sm">
              {currentYear} SoccerConnect. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
