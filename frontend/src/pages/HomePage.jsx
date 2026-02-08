import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiShoppingBag,
  FiArrowRight,
  FiStar,
  FiCheck,
  FiPlay,
} from 'react-icons/fi';
import { GiSoccerBall, GiSoccerField, GiWhistle, GiTrophy } from 'react-icons/gi';

const HomePage = () => {
  const features = [
    {
      icon: FiCalendar,
      title: 'Pickup Games',
      description:
        'Find and join local pickup games or create your own. Never miss a chance to play.',
      color: 'from-primary-500 to-emerald-600',
    },
    {
      icon: FiUsers,
      title: 'Team Management',
      description:
        'Create or join teams, manage rosters, and coordinate schedules with ease.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: FiMapPin,
      title: 'Field Discovery',
      description:
        'Explore local fields, check availability, and book your next game location.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: FiShoppingBag,
      title: 'Classifieds',
      description:
        'Buy, sell, or trade soccer gear. Find the equipment you need at great prices.',
      color: 'from-accent-500 to-orange-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Players' },
    { value: '500+', label: 'Teams Registered' },
    { value: '2,500+', label: 'Games Played' },
    { value: '150+', label: 'Partner Fields' },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: GiSoccerBall,
      title: 'Create Your Profile',
      description: 'Sign up and set your skill level, preferred positions, and availability.',
    },
    {
      step: 2,
      icon: GiSoccerField,
      title: 'Find or Create Games',
      description: 'Browse nearby pickup games or create your own event for others to join.',
    },
    {
      step: 3,
      icon: GiWhistle,
      title: 'Play & Connect',
      description: 'Meet up, play soccer, and connect with fellow players in your community.',
    },
    {
      step: 4,
      icon: GiTrophy,
      title: 'Build Your Reputation',
      description: 'Get rated, earn badges, and become a recognized player in the GTA.',
    },
  ];

  const testimonials = [
    {
      name: 'Marcus Chen',
      role: 'Team Captain, FC United',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote:
        "SoccerConnect completely changed how we organize our team. We went from struggling to get 11 players to having a waitlist!",
      rating: 5,
    },
    {
      name: 'Sarah Williams',
      role: 'Recreational Player',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      quote:
        "As someone new to Toronto, this app helped me find a soccer community in weeks. I've made amazing friends through pickup games.",
      rating: 5,
    },
    {
      name: 'David Okonkwo',
      role: 'League Organizer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      quote:
        "We use SoccerConnect to manage our entire 24-team league. The field booking feature alone saves us hours every week.",
      rating: 5,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        {/* Animated Soccer Ball Background */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-20 left-10 animate-bounce-slow">
            <GiSoccerBall className="w-16 h-16" />
          </div>
          <div className="absolute top-40 right-20 animate-pulse-slow">
            <GiSoccerBall className="w-24 h-24" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-bounce-slow delay-300">
            <GiSoccerBall className="w-12 h-12" />
          </div>
          <div className="absolute bottom-20 right-1/3 animate-pulse-slow delay-500">
            <GiSoccerBall className="w-20 h-20" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-400 font-medium">
              Now serving the Greater Toronto Area
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
            <span className="text-white">Connect. Play.</span>
            <br />
            <span className="gradient-text">Score Together.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-dark-300 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-100">
            The ultimate platform for the GTA soccer community. Find pickup games,
            join teams, discover local fields, and connect with players near you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
              Get Started Free
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="btn-secondary text-lg px-8 py-4 group">
              <FiPlay className="w-5 h-5" />
              Browse Games
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in animation-delay-300">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-dark-900 bg-gradient-to-br from-primary-500 to-accent-500"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                    backgroundSize: 'cover',
                  }}
                />
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-dark-900 bg-dark-800 flex items-center justify-center text-sm font-semibold text-primary-400">
                +9k
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar key={i} className="w-5 h-5 text-accent-400 fill-accent-400" />
                ))}
              </div>
              <p className="text-dark-400">
                <span className="text-white font-semibold">4.9/5</span> from 2,000+ reviews
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-dark-600 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-primary-500 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl lg:text-5xl font-display font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-dark-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Everything you need to <span className="gradient-text">play more</span>
            </h2>
            <p className="section-subtitle mx-auto">
              From finding games to managing teams, SoccerConnect has all the tools
              you need to enjoy the beautiful game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover group cursor-pointer"
              >
                <div
                  className={`
                    w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color}
                    flex items-center justify-center mb-6
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-gradient-to-b from-dark-900/50 to-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              How <span className="gradient-text">SoccerConnect</span> works
            </h2>
            <p className="section-subtitle mx-auto">
              Get from signing up to playing in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center group">
                {/* Connection Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                )}

                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-dark-800 border border-dark-700 mb-6 group-hover:border-primary-500/50 transition-colors">
                  <item.icon className="w-10 h-10 text-primary-400" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-dark-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Loved by <span className="gradient-text">players</span> across the GTA
            </h2>
            <p className="section-subtitle mx-auto">
              See what our community has to say about SoccerConnect.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-accent-400 fill-accent-400" />
                  ))}
                </div>
                <p className="text-dark-200 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title">
                Why players choose <span className="gradient-text">SoccerConnect</span>
              </h2>
              <p className="section-subtitle mb-8">
                We're more than just an app - we're building the future of grassroots soccer.
              </p>
              <div className="space-y-6">
                {[
                  'Real-time game updates and notifications',
                  'Smart matchmaking based on skill level',
                  'Verified player ratings and reviews',
                  'Integrated field booking and payments',
                  'Team chat and coordination tools',
                  'Mobile-first design for on-the-go access',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-4 h-4 text-primary-400" />
                    </div>
                    <p className="text-dark-200">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-3xl" />
              <div className="relative card p-8 lg:p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow mb-6">
                    <GiSoccerBall className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-4">
                    Ready to hit the pitch?
                  </h3>
                  <p className="text-dark-400 mb-6">
                    Join thousands of players already using SoccerConnect to find games and make connections.
                  </p>
                  <Link to="/register" className="btn-primary w-full">
                    Create Free Account
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 rounded-3xl blur-3xl" />
            <div className="relative card glass p-12 lg:p-16">
              <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                <span className="text-white">Start playing</span>{' '}
                <span className="gradient-text">today</span>
              </h2>
              <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
                Join the fastest-growing soccer community in the GTA. It's free to sign up,
                and you'll find your first game in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                  <FiArrowRight />
                </Link>
                <Link to="/events" className="btn-outline text-lg px-8 py-4">
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
