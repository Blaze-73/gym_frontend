import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Dumbbell, ShoppingBag, Users, AlertCircle, Info, Check, XCircle } from 'lucide-react';
import { membershipsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children, isAdmin = false }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

      const fetchNotifications = async () => {
    if (!user && !isAdmin) return; 

    setLoading(true);
    try {
      if (isAdmin) {
        const res = await membershipsAPI.getPending();
        const pendingMembers = res.data;
        
        const mapped = pendingMembers.map(m => ({
          id: m.id,
          type: 'user',
          title: 'Membership Request',
          body: `${m.user?.name} requested the ${m.plan?.name} plan.`,
          read: false,
          time: 'Recent',
          membershipId: m.id 
        }));
        setNotifications(mapped);
      } else {
        // CLIENT LOGIC: Get only MY membership
        const res = await membershipsAPI.getMe();
        const myMembership = res.data; // This is now a single object, not an array

        if (myMembership && myMembership.status === 'active') {
          // Create a unique ID for this specific membership activation
          const notificationId = `activation_${myMembership.id}`;
          
          // Check if the user has already seen this activation notification
          const hasSeen = localStorage.getItem(notificationId);

          if (!hasSeen) {
            const welcomeNote = {
              id: notificationId,
              type: 'info',
              title: 'Protocol Activated',
              body: `Welcome to the elite. Your ${myMembership.plan?.name} membership is now ACTIVE.`,
              read: false,
              time: 'Just now'
            };

            setNotifications(prev => [welcomeNote, ...prev]);
            
            // Save to localStorage so it doesn't pop up on every page refresh
            localStorage.setItem(notificationId, 'true');
          }
        } else {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };



  // ✅ NEW: Function to handle Approval/Rejection
  const handleMembershipAction = async (membershipId, status) => {
    try {
      await membershipsAPI.update(membershipId, { status });
      // Refresh notifications immediately to remove the handled request
      await fetchNotifications(); 
      return { success: true };
    } catch (error) {
      console.error("Action failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAdmin,user]);

  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, markRead, markAllRead, dismiss, unreadCount, loading, handleMembershipAction 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

const TypeIcon = ({ type }) => {
  const map = {
    workout: { icon: Dumbbell,      bg: 'bg-primary-fixed/15', color: 'text-primary-fixed' },
    order:   { icon: ShoppingBag,   bg: 'bg-blue-500/15',      color: 'text-blue-400'      },
    user:    { icon: Users,         bg: 'bg-purple-500/15',    color: 'text-purple-400'    },
    alert:   { icon: AlertCircle,   bg: 'bg-error/15',         color: 'text-error'         },
    info:    { icon: Info,          bg: 'bg-gray-500/15',      color: 'text-gray-400'      },
  };
  const { icon: Icon, bg, color } = map[type] || map.info;
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  );
};

const NotificationBell = ({ className = '' }) => {
  const { notifications, markRead, markAllRead, dismiss, unreadCount, handleMembershipAction } = useNotifications();
  const [open, setOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onAction = async (membershipId, status) => {
    setProcessingId(membershipId);
    try {
      await handleMembershipAction(membershipId, status);
    } catch (e) {
      alert("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen(o => !o)} className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                         bg-primary-fixed text-black text-[10px] font-black rounded-full
                         flex items-center justify-center leading-none"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[90vw]
                       bg-[#161616] border border-white/10 rounded-2xl shadow-2xl z-[90] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="font-headline font-black uppercase tracking-wider text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary-fixed hover:text-white transition-colors font-headline font-bold uppercase">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[450px] overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-600 text-sm font-headline uppercase">All caught up!</div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id} layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.03] ${!n.read ? 'bg-white/[0.02]' : ''}`}
                  >
                    <TypeIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-headline font-bold leading-tight ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.title}</p>
                        <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="text-gray-700 hover:text-gray-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                      
                      {/* ✅ QUICK ACTIONS FOR ADMIN */}
                      {n.type === 'user' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(n.membershipId, 'active'); }}
                            disabled={processingId === n.membershipId}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-lg text-[10px] font-black uppercase hover:bg-primary-fixed hover:text-black transition-all disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(n.membershipId, 'rejected'); }}
                            disabled={processingId === n.membershipId}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-error/10 text-error border border-error/20 rounded-lg text-[10px] font-black uppercase hover:bg-error hover:text-white transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Deny
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-gray-700 mt-2 font-headline uppercase">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary-fixed flex-shrink-0 mt-1.5 shadow-[0_0_6px_#daf900]" />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { NotificationBell };
export default NotificationProvider;
