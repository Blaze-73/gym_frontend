import { useState, useEffect, useMemo } from 'react';
import { usersAPI, membershipsAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, CheckCircle, XCircle, 
  Edit3, Trash2, Mail, Phone, 
  ShieldCheck, MoreVertical, UserPlus 
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'coach', label: 'Coach' },
  { value: 'admin', label: 'Admin' },
];

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modal States
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const emptyNewUser = () => ({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ per_page: 100 });
      const data = response.data.data || response.data;
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const updateMembershipStatus = async (membershipId, status) => {
    try {
      await membershipsAPI.update(membershipId, { status });
      await fetchMembers(); 
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await usersAPI.update(editUser.id, editUser);
      await fetchMembers();
      setEditUser(null);
    } catch (error) {
      alert('Update failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setFormError('');
    try {
      await usersAPI.create({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || null,
        password: newUser.password,
        role: newUser.role,
      });
      await fetchMembers();
      setNewUser(null);
    } catch (error) {
      const msg = error.response?.data?.message;
      const errors = error.response?.data?.errors;
      if (errors) {
        setFormError(Object.values(errors).flat().join(' '));
      } else {
        setFormError(msg || 'Failed to create user.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await usersAPI.delete(userToDelete.id);
      setMembers(prev => prev.filter(m => m.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="space-y-8 p-2 md:p-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
            MEMBER <span className="text-primary-fixed">DATABASE</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">
            System Administration & Access Control
          </p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2 h-12"
          onClick={() => {
            setFormError('');
            setNewUser(emptyNewUser());
          }}
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </Button>
      </div>

      {/* FILTER BAR (Glassmorphism) */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-fixed transition-colors" />
          <input
            type="text"
            placeholder="SEARCH ENTITY BY NAME OR EMAIL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm uppercase font-headline tracking-wider focus:outline-none focus:border-primary-fixed/50 transition-all placeholder:text-gray-600"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {['all', 'admin', 'coach', 'client'].map(role => (
            <button 
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                roleFilter === role 
                ? 'bg-primary-fixed text-black border-primary-fixed shadow-[0_0_15px_rgba(218,249,0,0.3)]' 
                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* MEMBER GRID (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => {
          const membership = member.memberships?.[0];
          return (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-surface-container-high border border-white/10 rounded-3xl p-6 relative group hover:border-primary-fixed/40 transition-all"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                  membership?.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  membership?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                  'bg-white/5 text-gray-500 border-white/10'
                }`}>
                  {membership?.status || 'Guest'}
                </span>
              </div>

              {/* Profile Top */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed/10 border border-primary-fixed/20 flex items-center justify-center text-primary-fixed font-black text-xl">
                  {member.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-headline font-bold text-white truncate text-lg uppercase">{member.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-tighter font-bold">{member.role}</p>
                </div>
              </div>

              {/* Info List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-primary-fixed" />
                  <span className="text-xs truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-primary-fixed" />
                  <span className="text-xs">{member.phone || 'No Phone Linked'}</span>
                </div>
              </div>

              {/* Quick Actions (Approval) */}
              {membership?.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button 
                    onClick={() => updateMembershipStatus(membership.id, 'active')}
                    className="p-2 bg-primary-fixed/10 text-primary-fixed rounded-xl hover:bg-primary-fixed hover:text-black transition-all flex items-center justify-center gap-1 text-[10px] font-black uppercase"
                  >
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button 
                    onClick={() => updateMembershipStatus(membership.id, 'rejected')}
                    className="p-2 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] font-black uppercase"
                  >
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}

              {/* Admin Management Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditUser(member)}
                    className="p-2 bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors" 
                    title="Edit User"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setUserToDelete(member)}
                    className="p-2 bg-white/5 text-gray-400 hover:text-error rounded-lg transition-colors" 
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                  ID: {member.id}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ADD USER MODAL */}
      <Modal isOpen={!!newUser} onClose={() => setNewUser(null)} title="Add New User" size="md">
        {newUser && (
          <form onSubmit={handleCreateUser} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password * (min 8 characters)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Role *</label>
                <Select
                  value={newUser.role}
                  onChange={(role) => setNewUser({ ...newUser, role })}
                  options={ROLE_OPTIONS}
                />
                {newUser.role === 'coach' && (
                  <p className="text-xs text-primary-fixed/80">
                    Creates a coach account with full platform access (Coach Pass). A coach profile is linked automatically.
                  </p>
                )}
              </div>
            </div>
            {formError && (
              <p className="text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3">{formError}</p>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => setNewUser(null)} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" loading={isCreating} className="flex-1 flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" /> Create User
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Update Entity Data" size="md">
        {editUser && (
          <form onSubmit={handleUpdateUser} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={editUser.name} 
                  onChange={e => setEditUser({...editUser, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={editUser.email} 
                  onChange={e => setEditUser({...editUser, email: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" 
                  value={editUser.phone || ''} 
                  onChange={e => setEditUser({...editUser, phone: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-fixed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Role</label>
                <Select
                  value={editUser.role}
                  onChange={(role) => setEditUser({ ...editUser, role })}
                  options={ROLE_OPTIONS}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditUser(null)} className="flex-1">Cancel</Button>
              <Button 
                type="submit" 
                variant="primary" 
                loading={isUpdating} 
                className="flex-1"
              >
                Update Data
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Terminate User" size="sm">
        {userToDelete && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto border border-error/30">
              <Trash2 className="w-8 h-8" />
            </div>
            <p className="text-gray-400">
              Are you sure you want to delete <span className="text-white font-bold">{userToDelete.name}</span>? <br />
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setUserToDelete(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={handleDeleteUser} className="flex-1">Delete Forever</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMembers;
