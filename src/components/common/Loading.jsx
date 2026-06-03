import { motion } from 'framer-motion';

const Loading = ({ fullScreen = true, size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const LoadingSpinner = () => (
    <div className={`${sizes[size]} border-2 border-primary-fixed border-t-transparent rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-surface flex flex-col items-center justify-center"
      >
        <LoadingSpinner />
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-on-surface-variant text-sm font-headline uppercase tracking-widest mt-4"
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
};

export default Loading;
