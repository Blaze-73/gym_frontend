import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Dumbbell, ShoppingCart, User, ChevronDown, LogOut, Settings, Home, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

// ✅ Simplified: this navbar is ONLY used inside PublicLayout (unauthenticated pages).
// Admin pages use AdminLayout's own header.
// Client pages use ClientSidebar's own mobile header.
// Previously this component also rendered DesktopSidebar / MobileSidebar for authed users
// which caused duplicate navbars whenever ClientLayout also included this component.

const PUBLIC_NAV = [
  { name: 'Home',   href: '/',      icon: Home    },
  { name: 'Plans',  href: '/plans', icon: Package },
  { name: 'Store',  href: '/store', icon: Package },
];

const UnifiedNavbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (href) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-sm bg-primary-fixed shadow-[0_0_8px_#daf900]" />
              <span className="text-xl font-black font-headline text-white tracking-widest">
                ALIEN FITNESS
              </span>
            </Link>

            {/* Desktop public links (shown when not logged in) */}
            {!user && (
              <div className="hidden md:flex items-center gap-1">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-4 py-2 text-sm font-headline font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-fixed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Open cart drawer"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-fixed text-on-primary-fixed
                                 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

              {/* User area */}
              {user ? (
                /* Logged-in: compact dropdown */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-fixed/20 border border-primary-fixed/40
                                    flex items-center justify-center">
                      <span className="text-primary-fixed text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-headline font-bold text-white">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-white/10
                                   rounded-xl shadow-2xl py-2 z-50"
                      >
                        <Link
                          to={user.role === 'admin' ? '/admin' : '/dashboard'}
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="my-1 border-t border-white/5" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error
                                     hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Not logged in: Login + Register */
                <>
                  <Link
                    to="/login"
                    className="hidden md:block px-4 py-2 text-sm font-headline font-bold uppercase
                               text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-primary-fixed text-on-primary-fixed rounded-full
                               text-sm font-headline font-bold uppercase tracking-wider
                               hover:scale-105 transition-transform shadow-[0_0_12px_#daf90050]"
                  >
                    Join Now
                  </Link>
                </>
              )}

              {/* Mobile hamburger (public pages only) */}
              {!user && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu (public pages, not logged in) */}
        <AnimatePresence>
          {mobileOpen && !user && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'tween', duration: 0.28 }}
                className="fixed left-0 top-0 h-full w-[280px] bg-[#111] border-r border-white/5
                           z-50 md:hidden flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-primary-fixed" />
                    <span className="text-lg font-black font-headline text-white tracking-widest">ALIEN</span>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  {PUBLIC_NAV.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-headline font-bold uppercase
                                  tracking-wider transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-fixed/10 text-primary-fixed'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-headline font-bold uppercase
                               bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-headline font-bold uppercase
                               bg-primary-fixed text-on-primary-fixed rounded-xl hover:scale-105 transition-transform"
                  >
                    Join Now
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default UnifiedNavbar;