import { Link } from 'react-router-dom';

export const LOGO_SRC = '/alien-logo.png?v=3';

/**
 * Brand logo + optional wordmark. Image is served from /public/alien-logo.png.
 */
const Logo = ({
  to = '/',
  showText = true,
  text = 'Alien Fitness',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizes = {
    sm: { img: 'h-7 w-7', text: 'text-sm leading-tight' },
    md: { img: 'h-9 w-9 sm:h-10 sm:w-10', text: 'text-base sm:text-lg leading-tight' },
    lg: { img: 'h-14 w-14 sm:h-16 sm:w-16', text: 'text-2xl sm:text-3xl' },
    xl: { img: 'h-20 w-20 sm:h-24 sm:w-24', text: 'text-3xl sm:text-4xl' },
  };
  const s = sizes[size] || sizes.md;

  const inner = (
    <>
      <img
        src={LOGO_SRC}
        alt="Alien Fitness"
        className={`object-contain shrink-0 drop-shadow-[0_0_10px_rgba(218,249,0,0.45)] ${s.img}`}
        width={96}
        height={96}
        decoding="async"
      />
      {showText && (
        <span className={`font-black font-headline text-white tracking-wide ${s.text}`}>
          {text}
        </span>
      )}
    </>
  );

  const wrapperClass = `flex items-center gap-2.5 shrink-0 ${className}`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={wrapperClass}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
};

export default Logo;
