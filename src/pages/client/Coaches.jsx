import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Star, Clock, Search, 
  Award, Target, MessageSquare, 
  ChevronRight, X, ShieldCheck 
} from 'lucide-react';
import { coachesAPI } from '@/services/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await coachesAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setCoaches(data);
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoach = async () => {
    if (!selectedCoach) return;
    setIsRequesting(true);
    try {
      await coachesAPI.assign({ coach_id: selectedCoach.id });
      alert('Request transmitted. The Architect will contact you shortly.');
      setSelectedCoach(null);
    } catch (error) {
      alert('Transmission failed. Please try again later.');
    } finally {
      setIsRequesting(false);
    }
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coach.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* --- HERO SECTION --- */}
      <header className="relative h-[400px] overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed/20 via-black to-black z-0" />
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4 inline-block px-4 py-1 border border-primary-fixed/30 rounded-full bg-primary-fixed/10 backdrop-blur-md"
          >
            <span className="text-primary-fixed text-[10px] font-headline font-bold uppercase tracking-[0.3em]">Elite Human Performance</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black font-headline text-white uppercase italic mb-6 leading-tight">
            PERFORMANCE <span className="text-primary-fixed">ARCHITECTS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Stop guessing. Start evolving. Access the world's most advanced <br className="hidden md:block" /> performance consultants to optimize your biology.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* --- FILTERS --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-fixed transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR SPECIALTY..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm uppercase font-headline tracking-wider focus:outline-none focus:border-primary-fixed/50 transition-all placeholder:text-gray-600" 
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
            <span>Available: {coaches.length}</span>
            <div className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Ranked by Performance</span>
          </div>
        </div>

        {/* --- COACH GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCoaches.length > 0 ? (
            filteredCoaches.map((coach, index) => (
              <motion.div 
                key={coach.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }} 
                whileHover={{ y: -10 }}
                className="group relative bg-surface-container-high border border-white/5 rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedCoach(coach)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  {coach.avatar ? (
                    <img src={coach.avatar} alt={coach.user?.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Users className="w-20 h-20 text-gray-800" /></div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-6 left-6">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full backdrop-blur-md border ${coach.is_available ? 'bg-primary-fixed/20 border-primary-fixed/50 text-primary-fixed' : 'bg-gray-500/20 border-gray-500/50 text-gray-400'}`}>
                      {coach.is_available ? 'Online' : 'Away'}
                    </span>
                  </div>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  {/* Quick Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-primary-fixed text-primary-fixed" />
                      <span className="text-sm font-bold">{coach.rating || '5.0'}</span>
                    </div>
                    <h3 className="text-2xl font-black font-headline text-white uppercase italic">{coach.user?.name}</h3>
                  </div>
                </div>

                {/* Bottom Detail Bar */}
                <div className="p-6 bg-black/50 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest">{coach.specialization || 'Elite Coach'}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary-fixed group-hover:text-black transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-surface-container-high rounded-3xl border border-dashed border-white/10">
              <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-headline uppercase tracking-widest">No Architects match your search</p>
            </div>
          )}
        </section>
      </main>

      {/* --- DETAILED PROFILE MODAL --- */}
      <Modal 
        isOpen={!!selectedCoach} 
        onClose={() => setSelectedCoach(null)} 
        title="Architect Profile" 
        size="lg"
      >
        {selectedCoach && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side: Visuals */}
            <div className="space-y-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                {selectedCoach.avatar ? (
                  <img src={selectedCoach.avatar} alt={selectedCoach.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Users className="w-24 h-24 text-gray-800" /></div>
                )}
                <div className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-primary-fixed/30 text-primary-fixed">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-primary-fixed" />
                    <span className="font-black font-headline">{selectedCoach.rating || '5.0'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Clock className="w-5 h-5 text-primary-fixed mb-2" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Experience</p>
                  <p className="text-lg font-black font-headline">{selectedCoach.experience_years || 0} Years</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Award className="w-5 h-5 text-primary-fixed mb-2" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Rating</p>
                  <p className="text-lg font-black font-headline">Top 1% Elite</p>
                </div>
              </div>
            </div>

            {/* Right Side: Bio & Specs */}
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h2 className="text-3xl font-black font-headline text-white uppercase italic">{selectedCoach.user?.name}</h2>
                <p className="text-primary-fixed font-bold uppercase tracking-widest text-sm">{selectedCoach.specialization}</p>
              </div>

              <div className="space-y-6 flex-1">
                <section>
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Professional Bio</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                    {selectedCoach.bio || "This architect specializes in high-performance optimization and biological recalibration. Focused on delivering peak physical output through precision training."}
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.certifications ? selectedCoach.certifications.split(',').map((cert, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-fixed/10 text-primary-fixed text-[10px] font-bold uppercase rounded-lg border border-primary-fixed/20">
                        {cert.trim()}
                      </span>
                    )) : <span className="text-gray-600 text-xs italic">Certified Elite Specialist</span>}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Expertise Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.expertise_areas ? selectedCoach.expertise_areas.map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-gray-300 text-[10px] font-bold uppercase rounded-lg border border-white/10">
                        {area}
                      </span>
                    )) : <span className="text-gray-600 text-xs italic">Multi-disciplinary expert</span>}
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button 
                  onClick={handleAssignCoach} 
                  loading={isRequesting}
                  variant="primary" 
                  className="w-full py-4"
                >
                  {isRequesting ? 'Transmitting...' : 'Request Architecture'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Coaches;
