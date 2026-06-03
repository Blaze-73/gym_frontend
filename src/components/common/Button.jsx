import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-fixed text-on-primary-fixed hover:scale-105 neon-glow',
    secondary: 'bg-surface-container-highest text-on-surface border border-white/10 hover:bg-white/5',
    danger: 'bg-error text-white hover:bg-error/90',
    outline: 'bg-transparent border border-primary-fixed text-primary-fixed hover:bg-primary-fixed/10',
    ghost: 'bg-transparent text-on-surface-variant hover:text-white hover:bg-white/5',
    success: 'bg-[#4CAF50] text-white hover:bg-[#45a049]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-4 text-lg',
  };

  const baseClasses = `
    font-headline font-bold tracking-widest uppercase rounded-lg
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
    text-tappable min-height-[44px] min-w-[120px]
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...props}
    >
      {loading && (
        <span className="spinner" />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
