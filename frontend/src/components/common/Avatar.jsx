import clsx from 'clsx';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const borderSizes = {
  xs: 'ring-1',
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-2',
  xl: 'ring-3',
  '2xl': 'ring-3',
};

const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  showStatus = false,
  status = 'offline',
  showBorder = true,
  onClick,
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-dark-500',
    busy: 'bg-danger-500',
    away: 'bg-warning-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        'relative inline-flex flex-shrink-0',
        onClick && 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 rounded-full',
        className
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            sizes[size],
            'rounded-full object-cover',
            showBorder && [borderSizes[size], 'ring-dark-800']
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={clsx(
            sizes[size],
            'rounded-full',
            'bg-gradient-to-br from-primary-500 to-secondary-500',
            'flex items-center justify-center',
            'text-white font-semibold',
            showBorder && [borderSizes[size], 'ring-dark-800']
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && (
        <span
          className={clsx(
            'absolute bottom-0 right-0',
            statusSizes[size],
            'rounded-full',
            statusColors[status],
            'ring-2 ring-dark-900'
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </Component>
  );
};

// Avatar group for showing multiple users
export const AvatarGroup = ({
  users = [],
  max = 4,
  size = 'md',
  className = '',
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const overlapSizes = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
    '2xl': '-ml-5',
  };

  return (
    <div className={clsx('flex items-center', className)}>
      {visibleUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          src={user.src || user.avatar || user.profileImage}
          name={user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
          size={size}
          className={clsx(
            index > 0 && overlapSizes[size],
            'hover:z-10 transition-transform hover:scale-110'
          )}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={clsx(
            sizes[size],
            overlapSizes[size],
            'rounded-full bg-dark-700 border-2 border-dark-900',
            'flex items-center justify-center',
            'text-dark-300 font-semibold'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// Avatar with name for lists
export const AvatarWithName = ({
  src,
  name,
  subtitle,
  size = 'md',
  className = '',
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        'flex items-center gap-3',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none',
        className
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <Avatar src={src} name={name} size={size} />
      <div className="min-w-0 text-left">
        <p className="font-medium text-white truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-dark-400 truncate">{subtitle}</p>
        )}
      </div>
    </Component>
  );
};

export default Avatar;
