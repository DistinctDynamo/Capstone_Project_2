import { FiInbox } from 'react-icons/fi';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No data found',
  description = 'There is nothing to display at the moment.',
  action,
  actionLabel = 'Get Started',
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-16 px-6 text-center
        ${className}
      `}
    >
      <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-dark-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-dark-400 max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
