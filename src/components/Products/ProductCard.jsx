import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';

// ✅ Note: ProductCard receives onAddToCart as a prop - no direct cart import needed.
// The parent component (Store, etc.) handles the cart logic.

const ProductCard = ({ product, onAddToCart }) => {
  const { id, name, description, price, stock, image, category, rating = 0 } = product;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-surface-container-high border border-white/5 overflow-hidden group rounded-xl"
    >
      <Link to={`/products/${id}`}>
        <div className="aspect-square overflow-hidden bg-surface-container-highest relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              No Image
            </div>
          )}

          {(!stock || stock === 0) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-4 py-2 bg-error text-white text-xs font-headline font-bold uppercase rounded">
                Out of Stock
              </span>
            </div>
          )}

          {rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-surface-container-highest/80 backdrop-blur rounded">
              <Star className="w-3 h-3 fill-tertiary-fixed text-tertiary-fixed" />
              <span className="text-xs font-bold text-on-surface">{rating}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
            {category?.name || 'Uncategorized'}
          </p>
          <h3 className="font-headline font-bold text-on-surface line-clamp-1 mb-2">{name}</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2 mb-4">{description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-black font-headline text-primary-fixed">
              ${price}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              disabled={!stock || stock === 0}
              className="p-2 bg-primary-fixed/10 text-primary-fixed rounded-full hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;