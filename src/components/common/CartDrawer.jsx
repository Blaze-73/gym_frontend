import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { paymentsAPI } from '@/services/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CheckoutForm, { emptyCheckoutForm } from '@/components/common/CheckoutForm';
import { resolveMediaUrl } from '@/utils/helpers';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { storeDiscountPercent, planName } = usePlanEntitlements();
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm);

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const discountAmount = storeDiscountPercent > 0 ? subtotal * storeDiscountPercent / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!showCheckoutForm) {
      setCheckoutForm(emptyCheckoutForm());
      setShowCheckoutForm(true);
      return;
    }
    if (!checkoutForm.customer_name?.trim() || !checkoutForm.customer_email?.trim()
      || !checkoutForm.customer_phone?.trim() || !checkoutForm.customer_address?.trim()) {
      setCheckoutError('Please fill in all contact fields.');
      return;
    }
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const res = await paymentsAPI.checkoutStore({
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
        ...checkoutForm,
      });
      const approvalUrl = res.data?.approval_url;
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setCheckoutError('Could not start PayPal checkout.');
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Increase quantity by re-adding
  const increase = (item) => addToCart(item);
  // Decrease — remove one unit
  const decrease = (item) => decreaseQty(item.id);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] z-[85]
                       bg-[#111] border-l border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary-fixed" />
                <h2 className="font-headline font-black uppercase tracking-wider text-white">
                  Cart
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-fixed text-black text-xs font-black rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order success */}
            <AnimatePresence>
              {orderDone && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-6 mt-4 p-4 bg-primary-fixed/10 border border-primary-fixed/30
                             rounded-xl text-center"
                >
                  <p className="text-primary-fixed font-headline font-black uppercase text-sm">
                    ✓ Order Placed Successfully!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Thank you for your purchase.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-700" />
                  <p className="font-headline font-bold uppercase text-gray-500">Your cart is empty</p>
                  <Link
                    to="/store"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 bg-primary-fixed text-black font-headline font-black
                               uppercase text-sm rounded-full hover:scale-105 transition-transform"
                  >
                    Browse Store
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 p-4 bg-white/[0.03] border border-white/5
                               rounded-xl hover:border-white/10 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                      {item.image
                        ? <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-white text-sm truncate">{item.name}</p>
                      <p className="text-primary-fixed font-black text-sm mt-0.5">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decrease(item)}
                          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10
                                     flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => increase(item)}
                          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10
                                     flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-error transition-colors self-start mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                {showCheckoutForm && (
                  <CheckoutForm form={checkoutForm} onChange={setCheckoutForm} />
                )}
                {checkoutError && (
                  <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">
                    {checkoutError}
                  </p>
                )}
                {storeDiscountPercent > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary-fixed font-bold">
                      <span>{planName} — {storeDiscountPercent}% off</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-headline uppercase text-sm tracking-wider">Total</span>
                  <span className="text-2xl font-black font-headline text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-4 bg-primary-fixed text-black font-headline font-black
                             uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98]
                             transition-all disabled:opacity-60 flex items-center justify-center gap-2
                             shadow-[0_0_20px_rgba(218,249,0,0.25)]"
                >
                  {checkingOut
                    ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    : <><span>{showCheckoutForm ? 'Pay with PayPal' : 'Continue to Checkout'}</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-xs font-headline uppercase tracking-wider
                             text-gray-600 hover:text-error transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;