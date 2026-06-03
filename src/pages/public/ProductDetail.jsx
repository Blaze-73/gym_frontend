import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/common/Button';

/**
 * ProductDetail
 *
 * Publicly accessible — no auth required to VIEW a product.
 * Authentication is only required when the user clicks "Add to Cart".
 * Removing the upfront redirect eliminates the 401 loop that occurred when
 * guests visited /store/:id through PublicLayout.
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await productsAPI.getOne(id);
      setProduct(response.data);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Gate add-to-cart behind authentication
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/store/${id}` } });
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 1000);
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  /* ── error / not found ── */
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-primary-fixed">Product not found</h2>
        <p className="mb-6 text-on-surface-variant">
          We couldn't load the product details. It may have been removed.
        </p>
        <Link to="/store" className="inline-flex p-5 m-5 items-center gap-2 text-on-surface-variant hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mt-12 mb-8">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-fixed transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-headline font-bold uppercase text-xs tracking-widest">
            Return to Gear Store
          </span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-high border border-white/5 rounded-lg overflow-hidden"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-on-surface-variant">
              No Image Available
            </div>
          )}
        </motion.div>

        {/* Product info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-4">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              {product.category?.name || 'Uncategorized'}
            </span>
            <h1 className="text-3xl font-black font-headline text-on-surface mt-2">
              {product.name}
            </h1>
          </div>

          {product.rating && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-tertiary-fixed text-tertiary-fixed'
                        : 'text-on-surface-variant'
                    }`}
                  />
                ))}
              </div>
              <span className="text-on-surface-variant text-sm">
                {product.rating} ({product.review_count ?? 0} reviews)
              </span>
            </div>
          )}

          <div className="text-4xl font-black font-headline text-primary-fixed mb-6">
            ${product.price}
          </div>

          <p className="text-on-surface-variant mb-8">{product.description}</p>

          {/* Stock badge */}
          <div className="mb-8">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-3">
              Stock Status
            </p>
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 px-4 py-2
                               bg-primary-fixed/10 text-primary-fixed rounded-full
                               text-sm font-headline">
                <Check className="w-4 h-4" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2
                               bg-error/10 text-error rounded-full text-sm font-headline">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + CTA */}
          {product.stock > 0 && (
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                  Quantity
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 bg-surface-container-highest rounded hover:bg-white/10 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-headline font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-2 bg-surface-container-highest rounded hover:bg-white/10 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button onClick={handleAddToCart} className="w-full" size="lg">
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 grid md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Fast Shipping',   desc: 'Free delivery on orders over $50' },
          { title: 'Secure Payment',  desc: '100% secure payment processing'   },
          { title: 'Easy Returns',    desc: '30-day return policy'              },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-surface-container-high border border-white/5 p-6 rounded-lg"
          >
            <h3 className="font-headline font-bold text-on-surface mb-2">{feature.title}</h3>
            <p className="text-on-surface-variant text-sm">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProductDetail;