import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const PlayerCard = ({
  player,
  size = 'md', // 'sm', 'md', 'lg'
  showStats = false,
  clickable = true,
  className = '',
}) => {
  // Calculate overall rating
  const overallRating = useMemo(() => {
    if (player.overall_rating) return player.overall_rating;

    const attrs = player.player_attributes || {};
    const pace = attrs.pace || 50;
    const shooting = attrs.shooting || 50;
    const passing = attrs.passing || 50;
    const dribbling = attrs.dribbling || 50;
    const defending = attrs.defending || 50;
    const physical = attrs.physical || 50;

    const position = player.position || '';

    switch (position) {
      case 'goalkeeper':
        return Math.round(
          defending * 0.30 + physical * 0.25 + pace * 0.15 +
          passing * 0.15 + dribbling * 0.10 + shooting * 0.05
        );
      case 'defender':
        return Math.round(
          defending * 0.30 + physical * 0.25 + pace * 0.15 +
          passing * 0.15 + dribbling * 0.10 + shooting * 0.05
        );
      case 'midfielder':
        return Math.round(
          passing * 0.25 + dribbling * 0.20 + physical * 0.15 +
          pace * 0.15 + defending * 0.15 + shooting * 0.10
        );
      case 'forward':
        return Math.round(
          shooting * 0.25 + pace * 0.20 + dribbling * 0.20 +
          passing * 0.15 + physical * 0.15 + defending * 0.05
        );
      default:
        return Math.round((pace + shooting + passing + dribbling + defending + physical) / 6);
    }
  }, [player]);

  // Get card tier based on rating
  const tier = useMemo(() => {
    if (overallRating >= 80) return 'gold';
    if (overallRating >= 65) return 'silver';
    return 'bronze';
  }, [overallRating]);

  // Size configurations
  const sizeConfig = {
    sm: {
      card: 'w-32 h-44',
      rating: 'text-2xl',
      position: 'text-xs',
      name: 'text-xs',
      avatar: 'w-14 h-14',
      stats: 'text-[10px]',
      padding: 'p-2',
    },
    md: {
      card: 'w-44 h-60',
      rating: 'text-3xl',
      position: 'text-sm',
      name: 'text-sm',
      avatar: 'w-20 h-20',
      stats: 'text-xs',
      padding: 'p-3',
    },
    lg: {
      card: 'w-56 h-80',
      rating: 'text-4xl',
      position: 'text-base',
      name: 'text-base',
      avatar: 'w-28 h-28',
      stats: 'text-sm',
      padding: 'p-4',
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Tier gradients and colors
  const tierStyles = {
    gold: {
      gradient: 'from-amber-600 via-yellow-500 to-amber-400',
      border: 'border-amber-400/50',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
      text: 'text-amber-900',
      accent: 'text-amber-800',
    },
    silver: {
      gradient: 'from-slate-500 via-gray-400 to-slate-300',
      border: 'border-slate-400/50',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
      text: 'text-slate-800',
      accent: 'text-slate-700',
    },
    bronze: {
      gradient: 'from-amber-800 via-orange-700 to-amber-600',
      border: 'border-orange-400/50',
      glow: 'shadow-[0_0_15px_rgba(217,119,6,0.3)]',
      text: 'text-orange-900',
      accent: 'text-orange-800',
    },
  };

  const style = tierStyles[tier];

  // Position abbreviation
  const getPositionAbbr = (position) => {
    switch (position) {
      case 'goalkeeper': return 'GK';
      case 'defender': return 'DEF';
      case 'midfielder': return 'MID';
      case 'forward': return 'FWD';
      default: return 'PLY';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const playerName = player.full_name ||
    `${player.first_name || ''} ${player.last_name || ''}`.trim() ||
    player.username || 'Unknown';

  const attrs = player.player_attributes || {};

  const cardContent = (
    <div
      className={`
        ${config.card} ${config.padding}
        relative overflow-hidden rounded-xl
        bg-gradient-to-b ${style.gradient}
        ${style.border} border-2
        ${style.glow}
        transform transition-all duration-300
        ${clickable ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cardPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="black" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cardPattern)" />
          </svg>
        </div>
      </div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section: Rating and Position */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col items-center">
            <span className={`${config.rating} font-bold ${style.text} leading-none`}>
              {overallRating}
            </span>
            <span className={`${config.position} font-semibold ${style.accent} uppercase`}>
              {getPositionAbbr(player.position)}
            </span>
          </div>
          {/* Nation flag placeholder */}
          {player.nationality && (
            <div className="flex flex-col items-center">
              <div className="w-6 h-4 bg-dark-800/30 rounded-sm flex items-center justify-center text-[8px] font-bold">
                {player.nationality.substring(0, 3).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center">
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={playerName}
              className={`${config.avatar} rounded-full object-cover border-2 border-dark-800/30`}
            />
          ) : (
            <div
              className={`
                ${config.avatar} rounded-full
                bg-dark-800/30
                flex items-center justify-center
                text-lg font-bold ${style.text}
                border-2 border-dark-800/30
              `}
            >
              {getInitials(playerName)}
            </div>
          )}
        </div>

        {/* Player name */}
        <div className="text-center mt-2">
          <p className={`${config.name} font-bold ${style.text} truncate`}>
            {playerName}
          </p>
          {player.team?.team_name && (
            <p className={`${config.stats} ${style.accent} truncate`}>
              {player.team.team_name}
            </p>
          )}
        </div>

        {/* Stats row */}
        {showStats && (
          <div className="mt-2 pt-2 border-t border-dark-800/20">
            <div className="grid grid-cols-6 gap-1 text-center">
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.pace || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>PAC</div>
              </div>
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.shooting || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>SHO</div>
              </div>
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.passing || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>PAS</div>
              </div>
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.dribbling || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>DRI</div>
              </div>
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.defending || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>DEF</div>
              </div>
              <div>
                <div className={`${config.stats} font-bold ${style.text}`}>{attrs.physical || 50}</div>
                <div className={`${config.stats} ${style.accent}`}>PHY</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to={`/players/${player._id || player.id}`} className="inline-block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default PlayerCard;
