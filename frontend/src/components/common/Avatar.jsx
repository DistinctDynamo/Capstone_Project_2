const sizes = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  showStatus = false,
  status = 'offline',
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-dark-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`
            ${sizes[size]}
            rounded-full object-cover
            ring-2 ring-dark-700
          `}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}
            rounded-full
            bg-gradient-to-br from-primary-500 to-accent-500
            flex items-center justify-center
            text-white font-semibold
            ring-2 ring-dark-700
          `}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full
            ${statusColors[status]}
            ring-2 ring-dark-800
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
