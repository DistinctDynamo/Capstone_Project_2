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
      { label: 'Marketplace', to: '/classifieds' },
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
    <footer className="bg-[#0d1219] border-t border-[#1c2430]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#1a5f2a] rounded-lg flex items-center justify-center">
                <GiSoccerBall className="w-5 h-5 text-[#4ade80]" />
              </div>
              <span className="text-lg font-bold text-white">
                Soccer<span className="text-[#4ade80]">Connect</span>
              </span>
            </Link>
            <p className="text-[#64748b] text-sm mb-5 max-w-sm">
              Connecting the GTA soccer community. Find pickup games, join teams,
              discover local fields, and connect with fellow players.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-3 text-[#64748b]">
                <FiMapPin className="w-4 h-4 text-[#4ade80]" />
                <span>Greater Toronto Area, Canada</span>
              </div>
              <div className="flex items-center gap-3 text-[#64748b]">
                <FiMail className="w-4 h-4 text-[#4ade80]" />
                <a
                  href="mailto:hello@soccerconnect.ca"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  hello@soccerconnect.ca
                </a>
              </div>
              <div className="flex items-center gap-3 text-[#64748b]">
                <FiPhone className="w-4 h-4 text-[#4ade80]" />
                <a
                  href="tel:+14165551234"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  (416) 555-1234
                </a>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wide mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[#64748b] text-sm hover:text-[#4ade80] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[#64748b] text-sm hover:text-[#4ade80] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wide mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[#64748b] text-sm hover:text-[#4ade80] transition-colors"
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
      <div className="border-t border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#4a5568] text-xs">
              © {currentYear} SoccerConnect. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center text-[#64748b] hover:text-[#4ade80] hover:border-[#4ade80]/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
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
