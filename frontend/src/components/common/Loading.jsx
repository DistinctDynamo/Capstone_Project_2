const sizes = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
};

const Loading = ({ size = 'md', className = '', text = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-primary-500 border-t-transparent
          rounded-full animate-spin
        `}
      />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );
};

export const LoadingPage = ({ text = 'Loading...' }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loading size="lg" text={text} />
  </div>
);

export const LoadingOverlay = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center">
    <div className="card p-8">
      <Loading size="lg" text={text} />
    </div>
  </div>
);

export default Loading;
