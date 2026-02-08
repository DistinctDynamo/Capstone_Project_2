import { useMemo } from 'react';

const PlayerStatsRadar = ({
  stats = {},
  size = 280,
  showLabels = true,
  animated = true
}) => {
  const attributes = useMemo(() => [
    { key: 'pace', label: 'PAC', value: stats.pace || 50 },
    { key: 'shooting', label: 'SHO', value: stats.shooting || 50 },
    { key: 'passing', label: 'PAS', value: stats.passing || 50 },
    { key: 'dribbling', label: 'DRI', value: stats.dribbling || 50 },
    { key: 'defending', label: 'DEF', value: stats.defending || 50 },
    { key: 'physical', label: 'PHY', value: stats.physical || 50 },
  ], [stats]);

  const center = size / 2;
  const maxRadius = (size / 2) - 40;
  const angleStep = (2 * Math.PI) / 6;
  const startAngle = -Math.PI / 2; // Start from top

  // Calculate point positions for the stat polygon
  const getPoint = (value, index) => {
    const angle = startAngle + (index * angleStep);
    const radius = (value / 99) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Generate polygon points for stats
  const statPoints = attributes.map((attr, i) => getPoint(attr.value, i));
  const statPathData = statPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Generate grid circles
  const gridLevels = [20, 40, 60, 80, 99];

  // Get color based on average stat value
  const avgStat = attributes.reduce((sum, a) => sum + a.value, 0) / 6;
  const getStatColor = () => {
    if (avgStat >= 80) return { fill: 'rgba(251, 191, 36, 0.3)', stroke: '#fbbf24' }; // Gold
    if (avgStat >= 65) return { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#22c55e' }; // Green
    if (avgStat >= 50) return { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6' }; // Blue
    return { fill: 'rgba(148, 163, 184, 0.3)', stroke: '#94a3b8' }; // Gray
  };

  const colors = getStatColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={animated ? 'animate-fade-in' : ''}
      >
        {/* Background grid circles */}
        {gridLevels.map((level) => {
          const radius = (level / 99) * maxRadius;
          return (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Grid lines from center to each vertex */}
        {attributes.map((_, i) => {
          const angle = startAngle + (i * angleStep);
          const endX = center + maxRadius * Math.cos(angle);
          const endY = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Stats polygon with gradient */}
        <defs>
          <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d={statPathData}
          fill="url(#statGradient)"
          stroke={colors.stroke}
          strokeWidth="2"
          className={animated ? 'transition-all duration-700 ease-out' : ''}
          style={animated ? {
            animation: 'radarExpand 0.8s ease-out forwards',
            transformOrigin: 'center'
          } : {}}
        />

        {/* Stat points */}
        {statPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={colors.stroke}
            className={animated ? 'transition-all duration-500' : ''}
          />
        ))}
      </svg>

      {/* Labels */}
      {showLabels && attributes.map((attr, i) => {
        const angle = startAngle + (i * angleStep);
        const labelRadius = maxRadius + 28;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        return (
          <div
            key={attr.key}
            className="absolute flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-xs font-bold text-dark-400">{attr.label}</span>
            <span className="text-sm font-bold text-white">{attr.value}</span>
          </div>
        );
      })}

      <style>{`
        @keyframes radarExpand {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerStatsRadar;
