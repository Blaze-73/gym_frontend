import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Utensils, Users, Calendar,
  Settings, LogOut, Menu, X, ShoppingBag, ShoppingCart, Package, Crown, ClipboardList, GraduationCap, Mail, QrCode,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coachesAPI } from '@/services/api';
import SubscriptionStatusBanner from '@/components/subscription/SubscriptionStatusBanner';
import { useCart } from '@/contexts/CartContext';
import { NotificationBell } from '@/components/common/NotificationDropdown';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard'  },
  { icon: Dumbbell,        label: 'Workouts',   path: '/workout'   },
  { icon: Utensils,        label: 'Nutrition',  path: '/nutrition' },
  { icon: Users,           label: 'Coaches',    path: '/coaches'   },
  { icon: Calendar,        label: 'Class Schedule', path: '/schedule' },
  { icon: QrCode,          label: 'Check In',       path: '/attendance-pass' },
  { icon: ShoppingBag,     label: 'Store',      path: '/store'     },
  { icon: ClipboardList,   label: 'My Orders',  path: '/my-orders' },
  { icon: Package,         label: 'Membership Plans', path: '/plans' },
  { icon: Crown,           label: 'My Subscription', path: '/subscription' },
  { icon: Settings,        label: 'Settings',   path: '/settings'  },
];

const NavLink = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-primary-fixed/10 text-primary-fixed'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {isActive && (
        <motion.span
          layoutId="clientActiveBar"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary-fixed"
        />
      )}
      <Icon
        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200
          ${isActive ? 'text-primary-fixed' : 'group-hover:scale-110'}`}
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

const SidebarBody = ({ onClose, location, user, onLogout, navItems }) => (
  <div className="flex flex-col h-full">
    <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
      <Logo to="/" onClick={onClose} size="md" />
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
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-headline font-bold text-white text-sm truncate">
            {user?.name || 'Athlete'}
          </p>
          <SubscriptionStatusBanner variant="inline" />
        </div>
      </div>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-4 mb-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-gray-600">
        Navigation
      </p>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          item={item}
          isActive={
            item.path === '/programs'
              ? location.pathname === '/programs'
              : location.pathname.startsWith(item.path)
          }
          onClick={onClose}
        />
      ))}
    </nav>

    <div className="px-3 py-4 border-t border-white/5 flex-shrink-0">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-error
                   hover:bg-error/10 rounded-xl transition-all duration-200 group"
      >
        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
        <span className="font-headline font-bold text-sm uppercase tracking-wider">Logout</span>
      </button>
    </div>
  </div>
);

const ClientSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCoachStaff, setIsCoachStaff] = useState(false);
  const location = useLocation();
  const { user, logout, isCoach } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();

  const coachAccount = isCoach();
  const baseNav = coachAccount
    ? NAV_ITEMS.filter((item) => !['/subscription', '/plans'].includes(item.path))
    : NAV_ITEMS;

  const sidebarNavItems = [
    ...(coachAccount || isCoachStaff
      ? [{ icon: GraduationCap, label: 'My Clients', path: '/coach-portal' }]
      : []),
    ...(!coachAccount
      ? [{ icon: Mail, label: 'Coach Inbox', path: '/my-coach' }]
      : []),
    ...baseNav,
  ].filter(
    (item, index, arr) => arr.findIndex((x) => x.path === item.path) === index
  );

  useEffect(() => {
    coachesAPI.isStaff()
      .then((res) => setIsCoachStaff(!!res.data?.is_coach))
      .catch(() => setIsCoachStaff(false));
  }, [user?.id]);

  const handleLogout = async () => {
    try { 
      await logout(); 
    } catch { /* ignore */ }
    localStorage.removeItem('token');
    window.location.replace('/');
  };

  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="lg:hidden fixed left-0 top-0 h-full w-[280px] z-[55]
                       bg-[#111] border-r border-white/5"
          >
            <SidebarBody
              onClose={() => setIsOpen(false)}
              location={location}
              user={user}
              onLogout={() => setShowLogoutModal(true)}
              navItems={sidebarNavItems}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[280px] z-40
                        bg-[#111] border-r border-white/5">
        <SidebarBody
          onClose={null}
          location={location}
          user={user}
          onLogout={() => setShowLogoutModal(true)}
          navItems={sidebarNavItems}
        />
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-[45] h-16
                         bg-[#111]/95 backdrop-blur-md border-b border-white/5
                         flex items-center justify-between px-4">
        <Logo to="/" size="sm" />

        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
            aria-label="Open cart"
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
            onClick={() => setIsOpen(true)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg
                       touch-manipulation hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-error/10 text-error rounded-lg
                       hover:bg-error/20 transition-colors touch-manipulation
                       text-xs font-headline font-bold uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Out</span>
          </button>
        </div>
      </header>

      <Modal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        title="Security Check" 
        size="sm"
      >
        <div className="text-center space-y-6 py-4">
          <p className="text-gray-400">Ready to disconnect from the Alien System?</p>
          <div className="flex gap-3">
            <Button onClick={() => setShowLogoutModal(false)} variant="secondary" className="flex-1">Stay</Button>
            <Button onClick={handleLogout} variant="danger" className="flex-1">Exit</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClientSidebar;
