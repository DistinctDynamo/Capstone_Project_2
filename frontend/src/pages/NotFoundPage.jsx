import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Button } from '../components/common';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Animated Soccer Ball */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center animate-bounce-slow">
            <GiSoccerBall className="w-20 h-20 text-primary-400" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-dark-950/50 rounded-full blur-md" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-display font-bold mb-4">
          <span className="gradient-text">4</span>
          <span className="text-white">0</span>
          <span className="gradient-text">4</span>
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Oops! Ball out of bounds
        </h2>
        <p className="text-dark-400 mb-8">
          The page you're looking for seems to have been kicked off the field.
          Let's get you back in the game.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary" leftIcon={<FiHome />}>
              Back to Home
            </Button>
          </Link>
          <Button
            variant="secondary"
            leftIcon={<FiArrowLeft />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-dark-800">
          <p className="text-sm text-dark-400 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/events" className="text-primary-400 hover:text-primary-300 text-sm">
              Find Games
            </Link>
            <span className="text-dark-600">|</span>
            <Link to="/teams" className="text-primary-400 hover:text-primary-300 text-sm">
              Browse Teams
            </Link>
            <span className="text-dark-600">|</span>
            <Link to="/fields" className="text-primary-400 hover:text-primary-300 text-sm">
              Discover Fields
            </Link>
            <span className="text-dark-600">|</span>
            <Link to="/classifieds" className="text-primary-400 hover:text-primary-300 text-sm">
              Classifieds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
