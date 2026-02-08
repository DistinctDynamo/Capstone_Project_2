import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiShoppingBag,
  FiArrowRight,
  FiCheck,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import { GiSoccerBall, GiSoccerField, GiWhistle, GiTrophy } from 'react-icons/gi';

const HomePage = () => {
  const features = [
    {
      icon: FiCalendar,
      code: 'EVT',
      title: 'Pickup Games',
      description: 'Find and join local pickup games or create your own events.',
      link: '/events',
      color: '#a855f7',
    },
    {
      icon: FiUsers,
      code: 'TMS',
      title: 'Team Management',
      description: 'Create or join teams, manage rosters, and coordinate schedules.',
      link: '/teams',
      color: '#22c55e',
    },
    {
      icon: FiMapPin,
      code: 'FLD',
      title: 'Field Discovery',
      description: 'Explore local fields, check availability, and book locations.',
      link: '/fields',
      color: '#3b82f6',
    },
    {
      icon: FiShoppingBag,
      code: 'MKT',
      title: 'Marketplace',
      description: 'Buy, sell, or trade soccer gear at great prices.',
      link: '/classifieds',
      color: '#f59e0b',
    },
  ];

  const stats = [
    { value: '10,247', label: 'ACTIVE PLAYERS', trend: '+12%' },
    { value: '523', label: 'TEAMS', trend: '+8%' },
    { value: '2,891', label: 'GAMES PLAYED', trend: '+24%' },
    { value: '156', label: 'PARTNER FIELDS', trend: '+5%' },
  ];

  const howItWorks = [
    {
      step: '01',
      icon: GiSoccerBall,
      title: 'Create Profile',
      description: 'Set your skill level, preferred positions, and availability.',
    },
    {
      step: '02',
      icon: GiSoccerField,
      title: 'Find Games',
      description: 'Browse nearby pickup games or create your own event.',
    },
    {
      step: '03',
      icon: GiWhistle,
      title: 'Play & Connect',
      description: 'Meet up, play soccer, and connect with fellow players.',
    },
    {
      step: '04',
      icon: GiTrophy,
      title: 'Level Up',
      description: 'Get rated, earn badges, and build your reputation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
            </span>
            <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
              System Online • Greater Toronto Area
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-white">Connect. Play.</span>
            <br />
            <span className="text-[#4ade80]">Score Together.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#64748b] max-w-2xl mx-auto mb-10">
            The command center for GTA soccer. Find pickup games, join teams,
            discover local fields, and connect with players near you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center gap-2"
            >
              <FiZap className="w-5 h-5" />
              Get Started Free
            </Link>
            <Link
              to="/events"
              className="px-8 py-4 bg-[#141c28] text-white font-semibold rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] hover:border-[#3d4f63] transition-all flex items-center gap-2"
            >
              Browse Games
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Live Stats Scoreboard */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-1 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`p-6 ${index !== stats.length - 1 ? 'border-r border-[#1c2430]' : ''} ${index < 2 ? 'lg:border-r' : ''}`}
                >
                  <p className="text-3xl lg:text-4xl font-bold text-white font-mono mb-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-[#64748b] uppercase tracking-wider">{stat.label}</span>
                    <span className="text-xs text-[#4ade80]">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-[#2a3a4d] flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-[#4ade80] animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0d1219] border-y border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141c28] border border-[#2a3a4d] rounded text-xs text-[#64748b] uppercase tracking-wider mb-4">
              <FiActivity className="w-3 h-3 text-[#4ade80]" />
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything you need to <span className="text-[#4ade80]">play more</span>
            </h2>
            <p className="text-[#64748b] max-w-2xl mx-auto">
              From finding games to managing teams, SoccerConnect has all the tools
              you need to enjoy the beautiful game.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group bg-[#141c28] border border-[#2a3a4d] rounded-xl p-6 hover:border-[#3d4f63] transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-wider"
                    style={{ color: feature.color }}
                  >
                    {feature.code}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64748b] mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <FiArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141c28] border border-[#2a3a4d] rounded text-xs text-[#64748b] uppercase tracking-wider mb-4">
              <GiWhistle className="w-3 h-3 text-[#4ade80]" />
              Getting Started
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How <span className="text-[#4ade80]">SoccerConnect</span> works
            </h2>
            <p className="text-[#64748b] max-w-2xl mx-auto">
              Get from signing up to playing in just a few simple steps.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#2a3a4d] to-transparent" />
                )}

                <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 hover:border-[#2a3a4d] transition-all">
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-[#4ade80]" />
                    </div>
                    <span className="text-3xl font-bold font-mono text-[#2a3a4d]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#64748b]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-[#0d1219] border-y border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141c28] border border-[#2a3a4d] rounded text-xs text-[#64748b] uppercase tracking-wider mb-6">
                <GiTrophy className="w-3 h-3 text-[#4ade80]" />
                Why Choose Us
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Why players choose <span className="text-[#4ade80]">SoccerConnect</span>
              </h2>
              <p className="text-[#64748b] mb-8">
                We're more than just an app - we're building the future of grassroots soccer.
              </p>

              <div className="space-y-4">
                {[
                  'Real-time game updates and notifications',
                  'Smart matchmaking based on skill level',
                  'Verified player ratings and reviews',
                  'Integrated field booking system',
                  'Team chat and coordination tools',
                  'Mobile-first design for on-the-go access',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg">
                    <div className="w-8 h-8 rounded bg-[#1a5f2a]/30 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-4 h-4 text-[#4ade80]" />
                    </div>
                    <p className="text-sm text-[#94a3b8]">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/10 to-[#3b82f6]/10 rounded-2xl blur-3xl" />
              <div className="relative bg-[#141c28] border border-[#2a3a4d] rounded-2xl p-8 lg:p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1a5f2a] mb-6">
                    <GiSoccerBall className="w-10 h-10 text-[#4ade80]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to hit the pitch?
                  </h3>
                  <p className="text-[#64748b] mb-8">
                    Join thousands of players already using SoccerConnect to find games and make connections.
                  </p>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-[#0d1219] rounded-xl border border-[#1c2430]">
                    <div>
                      <p className="text-xl font-bold font-mono text-white">4.9</p>
                      <p className="text-xs text-[#64748b]">Rating</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-mono text-white">2K+</p>
                      <p className="text-xs text-[#64748b]">Reviews</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-mono text-white">10K+</p>
                      <p className="text-xs text-[#64748b]">Players</p>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="block w-full py-4 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all text-center"
                  >
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#0a0e14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-2xl p-12 lg:p-16 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                </span>
                <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
                  Games Available Now
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Start playing</span>{' '}
                <span className="text-[#4ade80]">today</span>
              </h2>
              <p className="text-lg text-[#64748b] mb-8 max-w-2xl mx-auto">
                Join the fastest-growing soccer community in the GTA. It's free to sign up,
                and you'll find your first game in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center gap-2"
                >
                  Get Started Free
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/events"
                  className="px-8 py-4 bg-[#141c28] text-white font-semibold rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] hover:border-[#3d4f63] transition-all"
                >
                  View Upcoming Games
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
