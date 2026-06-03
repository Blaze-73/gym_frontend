import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, Package, Settings,
  Search, LogOut, Menu, X, ChevronDown, ShoppingBag, ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { NotificationBell } from '@/components/common/NotificationDropdown';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const NAV_ITEMS = [
  { path: '/admin',          label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/members',  label: 'Members',   icon: Users           },
  { path: '/admin/schedule', label: 'Schedule',  icon: Calendar        },
  { path: '/admin/products', label: 'Products',  icon: Package         },
  { path: '/admin/settings', label: 'Settings',  icon: Settings        },
];

const NavLink = ({ item, isActive }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-primary-fixed/10 text-primary-fixed'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {isActive && (
        <motion.span
          layoutId="adminActiveBar"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary-fixed"
        />
      )}
      <Icon
        className={`w-5 h-5 flex-shrink-0
          ${isActive ? 'text-primary-fixed' : 'group-hover:scale-110 transition-transform'}`}
      />
      <span className="font-headline font-bold text-sm uppercase tracking-wider">
        {item.label}
      </span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-fixed shadow-[0_0_6px_#daf900]" />
      )}
    </Link>
  );
};

const SidebarBody = ({ location, user, onLogout, onClose }) => (
  <div className="flex flex-col h-full">
    <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-sm bg-primary-fixed shadow-[0_0_8px_#daf900]" />
        <span className="text-xl font-black font-headline text-white tracking-widest">ALIEN</span>
      </Link>
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </div>

    <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-fixed/20 border border-primary-fixed/40
                        flex items-center justify-center flex-shrink-0">
          <span className="text-primary-fixed font-black font-headline text-lg leading-none">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-headline font-bold text-white text-sm truncate">
            {user?.name || 'Admin'}
          </p>
          <p className="text-[11px] text-primary-fixed uppercase tracking-wider">System Manager</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-4 mb-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-gray-600">
        Navigation
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
        />
      ))}
      <div className="pt-3 mt-3 border-t border-white/5">
        <p className="px-4 mb-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-gray-600">
          Quick Links
        </p>
        <Link
          to="/store"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400
                     hover:text-white hover:bg-white/5 transition-all group"
        >
          <ShoppingBag className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-headline font-bold text-sm uppercase tracking-wider">Store</span>
        </Link>
      </div>
    </nav>

    <div className="px-3 py-4 border-t border-white/5 flex-shrink-0">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-error
                   hover:bg-error/10 rounded-xl transition-all group"
      >
        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
        <span className="font-headline font-bold text-sm uppercase tracking-wider">Logout</span>
      </button>
    </div>
  </div>
);

const AdminLayout = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/login');
    }
  }, [loading, isAdmin, navigate]);

  const handleLogoutInitiate = () => setConfirmLogout(true);
  
  const executeLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  if (!isAdmin()) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[280px] z-40
                        bg-[#111] border-r border-white/5">
        <SidebarBody location={location} user={user} onLogout={handleLogoutInitiate} onClose={null} />
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="lg:hidden fixed left-0 top-0 h-full w-[280px] z-[55]
                       bg-[#111] border-r border-white/5 flex flex-col"
          >
            <SidebarBody
              location={location}
              user={user}
              onLogout={handleLogoutInitiate}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        <header className="h-16 lg:h-20 bg-[#111]/80 backdrop-blur-md border-b border-white/5
                           sticky top-0 z-40 flex items-center px-4 md:px-6 lg:px-8">

          <div className="hidden lg:flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search members, activities..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5
                           text-sm focus:outline-none focus:border-primary-fixed/50 transition-colors
                           placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="lg:hidden flex-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-primary-fixed shadow-[0_0_6px_#daf900]" />
              <span className="text-lg font-black font-headline text-white tracking-widest">ALIEN</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationBell />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5
                               bg-primary-fixed text-black text-[9px] font-black rounded-full
                               flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white/5 border border-white/10 rounded-lg
                         touch-manipulation hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={handleLogoutInitiate}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-error/10 text-error
                         rounded-lg hover:bg-error/20 transition-colors touch-manipulation
                         text-xs font-headline font-bold uppercase"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Out</span>
            </button>

            <div className="hidden lg:relative lg:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-headline font-bold leading-tight">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-[10px] text-primary-fixed uppercase tracking-tight">
                    System Manager
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-fixed/20 border border-primary-fixed/40
                                flex items-center justify-center">
                  <span className="text-primary-fixed font-bold text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10
                               rounded-xl shadow-2xl py-2 z-50"
                  >
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2.5 text-sm text-gray-300
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogoutInitiate(); }}
                      className="w-full px-4 py-2.5 text-sm text-error hover:bg-white/5
                                 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Modal 
        isOpen={confirmLogout} 
        onClose={() => setConfirmLogout(false)} 
        title="Confirm Exit" 
        size="sm"
      >
        <div className="text-center space-y-6 py-4">
          <p className="text-gray-400">Are you sure you want to leave the system? Your session will be terminated.</p>
          <div className="flex gap-3">
            <Button onClick={() => setConfirm .setConfirmLogout(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={executeLogout} variant="danger" className="flex-1">Logout</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
