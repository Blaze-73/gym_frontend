import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import { NotificationBell } from '@/components/common/NotificationDropdown';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const ClientLayout = () => {
  const { cartItems, setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-black text-white">
      <ClientSidebar />
      
      {/* Desktop Top Header - Fixed: Now purely for clients */}
      <header className="hidden lg:flex fixed top-0 right-0 left-[280px] h-16 bg-[#111]/80 backdrop-blur-md border-b border-white/5 z-40 items-center justify-between px-8">
        <div className="text-sm font-headline font-bold text-gray-400 uppercase tracking-widest">
          Athlete Command Center
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-fixed text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="lg:ml-[280px] min-h-screen">
        {/* Top padding to prevent content hiding under the header */}
        <div className="pt-16 lg:pt-8 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
