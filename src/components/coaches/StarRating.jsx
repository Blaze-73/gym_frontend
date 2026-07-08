import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, size = 'md', readOnly = false }) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const icon = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? 'img' : 'group'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const Btn = readOnly ? 'span' : 'button';
        return (
          <Btn
            key={star}
            type={readOnly ? undefined : 'button'}
            onClick={readOnly ? undefined : () => onChange?.(star)}
            className={readOnly ? 'inline-flex' : 'p-0.5 hover:scale-110 transition-transform'}
          >
            <Star
              className={`${icon} ${filled ? 'fill-primary-fixed text-primary-fixed' : 'text-gray-600'}`}
            />
          </Btn>
        );
      })}
    </div>
  );
};

export default StarRating;
