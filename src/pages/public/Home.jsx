import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import athleteImage from '../../pics/athlete image.png';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Heart, TrendingUp, Users, Award, Zap,
  Menu, X, Star, ChevronDown, CheckCircle,
  Clock, MapPin, Phone, Mail, Instagram, Facebook, Twitter,
  ArrowRight, Flame, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const gymRef = useRef(null);
  const featuresRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Plans', href: '/plans' },
    { name: 'Visual', href: '#gym', scroll: true },
    { name: 'Store', href: '/store' },
    { name: 'Membership', href: '/login', requireAuth: true },
  ];

  const handleNavClick = (link, e) => {
    e.preventDefault();
    if (link.requireAuth && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (link.scroll && gymRef.current) {
      gymRef.current.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(link.href);
  };

  const testimonials = [
    { name: 'Marcus T.', role: 'Member since 2022', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', rating: 5, text: 'Best gym experience ever! The equipment is top-notch and the trainers really care about your progress.' },
    { name: 'James R.', role: 'Elite Member', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', rating: 5, text: 'Transformed my life completely. Down 40lbs and feeling stronger than I ever have. The community here is incredible.' },
    { name: 'David K.', role: 'Member since 2023', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80', rating: 5, text: 'Worth every penny. The 24/7 access fits my schedule perfectly and the facilities are always clean.' },
    { name: 'Sarah M.', role: 'Premium Member', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', rating: 4, text: 'Great equipment and knowledgeable staff. The group classes are my favorite part of the membership.' },
    { name: 'Alex P.', role: 'Member since 2021', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', rating: 5, text: 'The tracking system keeps me accountable. I can see my progress over time which motivates me to keep going.' },
  ];

  const programs = [
    { icon: Heart, title: 'Cardio Training', desc: 'Boost endurance and heart health with high-energy cardio sessions', price: '$29/PLAN', color: 'from-red-500/20 to-red-600/20', iconColor: 'text-red-400' },
    { icon: Zap, title: 'Strength Build', desc: 'Develop power and resilience through expert-designed strength workouts', price: '$39/PLAN', color: 'from-primary-fixed/20 to-primary-fixed/10', iconColor: 'text-primary-fixed', popular: true },
    { icon: TrendingUp, title: 'Fat Loss', desc: 'Drop pounds safely with dynamic workouts and fat-burning routines', price: '$35/PLAN', color: 'from-orange-500/20 to-orange-600/20', iconColor: 'text-orange-400' },
    { icon: Clock, title: 'HIIT Workouts', desc: 'Push limits with short, intense high-interval training sessions', price: '$45/PLAN', color: 'from-purple-500/20 to-purple-600/20', iconColor: 'text-purple-400' },
  ];

  const features = [
    { icon: Heart, title: 'Nutrition Guidance', desc: 'Personalized meal plans' },
    { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor improvements' },
    { icon: Users, title: 'Community Support', desc: 'Train together' },
    { icon: Award, title: 'Expert Trainers', desc: 'Certified professionals' },
    { icon: Star, title: 'Premium Membership', desc: 'Exclusive access' },
    { icon: Dumbbell, title: 'Fitness Spaces', desc: 'Dedicated areas' },
  ];

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const stats = [
    { icon: Flame, value: '850', label: 'Calories' },
    { icon: Users, value: '2.4K', label: 'Members' },
    { icon: Activity, value: '150+', label: 'Workouts' },
    { icon: Award, value: '50+', label: 'Trainers' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 pb-20">
        <div className="absolute inset-0 bg-black" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-full max-h-[1200px] pointer-events-none">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-[150px]" />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-white/10 rounded-full blur-[120px]"
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="inline-block px-5 py-2 bg-primary-fixed/10 border border-primary-fixed/30 text-primary-fixed text-xs font-headline font-bold uppercase tracking-[0.2em] rounded-full">
              Premium Fitness Experience
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-headline leading-tight mb-4 tracking-tighter"
          >
            <span className="text-[#727854] uppercase">Build </span>
            <span className="text-[#E2F1AF] uppercase drop-shadow-[0_0_20px_rgba(226,241,175,0.3)]">Strength.</span><br />
            <span className="text-[#727854] uppercase">Build </span>
            <span className="text-[#E2F1AF] uppercase drop-shadow-[0_0_20px_rgba(226,241,175,0.3)]">Confidence.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 50 }}
            className="relative w-full max-w-screen-xl mx-auto mb-16 -translate-y-16"
          >
            <div className="relative inline-block w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-white/10 rounded-full blur-[120px]" />

              <img
                src={athleteImage}
                alt="Strong Athlete"
                className="relative w-full h-auto max-w-[1200px] mx-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,1)] z-10"
              />

              {/* Floating Stat Cards - Repositioned & Enlarged Containers */}
              <motion.div
                variants={floatVariants}
                animate="float"
                className="hidden sm:flex absolute top-[20%] left-[18%] bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-primary-fixed" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black font-headline text-primary-fixed leading-none">850</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Calories</p>
                </div>
              </motion.div>

              <motion.div
                variants={floatVariants}
                animate="float"
                transition={{ delay: 0.5 }}
                className="hidden sm:flex absolute top-[20%] right-[18%] bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary-fixed" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black font-headline text-primary-fixed leading-none">2.4K</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Members</p>
                </div>
              </motion.div>

              <motion.div
                variants={floatVariants}
                animate="float"
                transition={{ delay: 1 }}
                className="hidden sm:flex absolute bottom-[20%] left-[18%] bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-primary-fixed" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black font-headline text-primary-fixed leading-none">150+</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Workouts</p>
                </div>
              </motion.div>

              <motion.div
                variants={floatVariants}
                animate="float"
                transition={{ delay: 1.5 }}
                className="hidden sm:flex absolute bottom-[20%] right-[18%] bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-primary-fixed" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black font-headline text-primary-fixed leading-none">50+</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Trainers</p>
                </div>
              </motion.div>
            </div>

            <div className="flex sm:hidden justify-center gap-3 mt-8 flex-wrap px-2">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-2 bg-black/80 border border-primary-fixed/30 rounded-xl px-3 py-2"
                >
                  <div className="w-8 h-8 bg-primary-fixed/20 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-fixed" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-black font-headline text-primary-fixed leading-none">{value}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4"
          >
            <Link
              to="/register"
              className="group px-10 py-4 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-primary-fixed/40"
            >
              REGISTER NOW
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/store"
              className="px-10 py-4 bg-transparent border-2 border-white/10 text-white font-headline font-bold text-sm uppercase tracking-widest rounded-full hover:border-primary-fixed hover:bg-primary-fixed/10 transition-all text-center"
            >
              BROWSE GEAR
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-4 mb-20"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-black overflow-hidden ring-2 ring-primary-fixed/20">
                  <img
                    src="https://imgs.search.brave.com/FWHa9QRttw1JSSHVgTxnaCCKeCisCTYKWv3idxlo3AI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c3ZncmVwby5jb20v/c2hvdy8zMzU0NTUv/cHJvZmlsZS1kZWZh/dWx0LnN2Zw"
                    alt="Member"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm tracking-wide">Join <span className="text-white font-bold">2,400+</span> elite members</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10 overflow-hidden w-full"
          >
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-8">Trusted by athletes using</p>
            <div className="relative w-full overflow-hidden">
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                className="flex gap-16 sm:gap-24 whitespace-nowrap"
              >
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-16 sm:gap-24">
                    {['PUMA', 'NIKE', 'adidas', 'THE NORTH FACE', 'UNDER ARMOUR', 'REEBOK'].map((brand, i) => (
                      <div key={i} className="text-2xl sm:text-3xl font-bold text-white/20 hover:text-primary-fixed transition-colors cursor-default tracking-tighter">
                        {brand}
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-5 z-30">
          {[Instagram, Facebook, Twitter].map((Icon, i) => (
            <a key={i} href="#" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:border-primary-fixed hover:text-primary-fixed transition-all bg-black/40 backdrop-blur-md group">
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
        >
          <ChevronDown className="w-8 h-8 text-primary-fixed/50 animate-bounce" />
        </motion.div>
      </section>

      {/* ─── WELCOME ─── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 sm:mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary-fixed/10 rounded-[2rem] blur-3xl group-hover:bg-primary-fixed/20 transition-all" />
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80"
                alt="Barbell"
                className="relative rounded-[2rem] w-full object-cover aspect-[4/3] grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <span className="inline-block text-primary-fixed text-xs font-headline font-bold uppercase tracking-widest mb-4">About Us</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-headline mb-6 leading-tight tracking-tighter">
                Welcome To Our <span className="text-primary-fixed">GYM</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">
                Here you will find <span className="text-primary-fixed font-semibold">everything</span> you need to change your <span className="text-primary-fixed font-semibold">life</span> and shape it for the <span className="text-primary-fixed font-semibold">better</span>.
              </p>
              <Link
                to="/plans"
                className="inline-flex items-center gap-3 text-primary-fixed font-headline font-bold text-sm uppercase tracking-widest group self-start"
              >
                View Plans <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-24 sm:mb-32">
            {[
              {
                src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
                alt: 'Male Training', title: 'Strength Training', subtitle: 'For Men'
              },
              {
                src: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80',
                alt: 'Female Training', title: 'Fitness & Cardio', subtitle: 'For Women'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group rounded-[2rem] overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary-fixed/10 blur-2xl group-hover:blur-3xl transition-all" />
                <img
                  src={item.src}
                  alt={item.alt}
                  className="relative rounded-[2rem] w-full object-cover aspect-[4/3] group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 z-10">
                  <p className="text-white font-headline font-bold text-xl sm:text-2xl">{item.title}</p>
                  <p className="text-gray-300 text-sm uppercase tracking-widest">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GYM INTERIOR ─── */}
      <section ref={gymRef} id="gym" className="py-20 sm:py-32 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-black font-headline text-center mb-16 sm:mb-24 leading-tight tracking-tighter"
          >
            What The <span className="text-primary-fixed">GYM</span> Looks Like From Inside
          </motion.h2>

          {[
            {
              title: 'SPACE',
              desc: <><span className="text-primary-fixed">Spacious</span> and well optimized for good <span className="text-primary-fixed">airflow</span> to guarantee a <span className="text-primary-fixed">comfortable</span> session to our dear customers.</>,
              src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
              imgRight: true,
            },
            {
              title: 'MACHINES',
              desc: <>The <span className="text-primary-fixed">GYM</span> is equipped with the latest most efficient <span className="text-primary-fixed">machines</span> to <span className="text-primary-fixed">grant</span> a great experience for the user</>,
              src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
              imgRight: false,
            },
            {
              title: 'STAFF',
              desc: <>In This <span className="text-primary-fixed">GYM</span> You Will Find all what you <span className="text-primary-fixed">need</span> Whether its an <span className="text-primary-fixed">exceptional coach</span> or a great staff to <span className="text-primary-fixed">help Guide</span> you With whatever you <span className="text-primary-fixed">need</span></>,
              src: 'https://images.pexels.com/photos/33846716/pexels-photo-33846716.jpeg',
              imgRight: true,
            },
          ].map((item, i) => (
            <div key={i} className={`grid lg:grid-cols-2 gap-12 items-center ${i < 2 ? 'mb-24 sm:mb-40' : ''}`}>
              <motion.div
                initial={{ opacity: 0, x: item.imgRight ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={item.imgRight ? 'order-2 lg:order-1' : 'order-2'}
              >
                <h3 className="text-3xl sm:text-4xl font-black font-headline text-primary-fixed mb-4 tracking-tight">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: item.imgRight ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={item.imgRight ? 'order-1 lg:order-2' : 'order-1'}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="rounded-[2rem] w-full object-cover aspect-video shadow-2xl"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section ref={featuresRef} className="py-20 sm:py-32 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-headline leading-tight tracking-tighter">
              Inspired to <span className="text-primary-fixed">Inspire Your Best Self</span>
            </h2>
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-base sm:text-lg">
              We're Your Partner In Achieving A Healthier, Stronger, And More Confident You. Elevate your potential with our elite coaching.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-white/5 rounded-[3rem] p-8 sm:p-16 mb-24 sm:mb-32 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 gap-6 sm:gap-10">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-primary-fixed/20 rounded-2xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-primary-fixed" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-headline font-bold text-white block">{feature.title}</span>
                      <span className="text-xs text-gray-500">{feature.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80"
                  alt="Athlete"
                  className="w-[280px] sm:w-[350px] md:w-[400px] h-auto object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline mb-6 tracking-tighter">
              Discover <span className="text-primary-fixed">What Sets Us Apart</span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
              We Deliver A Fitness Experience That's Truly One-Of-A-Kind. Explore How We Help You Achieve Your Goals Faster And Smarter.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br ${program.color} border border-white/5 rounded-3xl p-8 hover:border-primary-fixed/40 transition-all group ${program.popular ? 'ring-2 ring-primary-fixed' : ''}`}
              >
                {program.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-headline font-bold uppercase rounded-full whitespace-nowrap">
                    Popular
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${program.popular ? 'bg-primary-fixed' : 'bg-white/5'}`}>
                  <program.icon className={`w-7 h-7 ${program.popular ? 'text-on-primary-fixed' : program.iconColor}`} />
                </div>
                <h4 className="text-xl sm:text-2xl font-headline font-bold mb-3">{program.title}</h4>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{program.desc}</p>
                <button className="w-full py-3 bg-primary-fixed text-on-primary-fixed text-xs font-headline font-bold uppercase rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary-fixed/20">
                  {program.price}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section ref={reviewsRef} className="py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-black font-headline text-center mb-6 tracking-tighter"
          >
            Customer <span className="text-primary-fixed">Reviews</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-16 sm:mb-20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-10 h-10 fill-primary-fixed text-primary-fixed" />
              <span className="text-6xl sm:text-7xl font-black font-headline text-white tracking-tighter">4.8/5</span>
            </div>
            <p className="text-gray-400 text-lg tracking-wide">Based on 2,784 verified reviews</p>
          </motion.div>

          <div className="relative overflow-hidden px-4">
            <motion.div
              animate={{ x: -currentTestimonial * (300 + 16) }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex gap-6"
            >
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="min-w-[300px] sm:min-w-[400px] bg-zinc-900 border border-white/5 rounded-3xl p-8 flex-shrink-0"
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary-fixed text-primary-fixed" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-8 text-base sm:text-lg leading-relaxed italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed/30"
                    />
                    <div className="text-left">
                      <p className="text-sm font-headline font-bold text-white">{testimonial.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentTestimonial ? 'w-10 bg-primary-fixed' : 'w-2 bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary-fixed/20 via-black to-black border border-primary-fixed/20 rounded-[3rem] p-12 sm:p-20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed/10 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black font-headline text-white uppercase mb-6 tracking-tighter">
                Ready to Begin?
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join today and get your first week free. No commitments, no hidden fees. Experience the pinnacle of performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link to="/register" className="group px-10 py-4 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-xl shadow-primary-fixed/30">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/store" className="px-10 py-4 bg-white/5 text-white font-headline font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors border border-white/10 text-center">
                  Browse Store
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 sm:py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <span className="text-3xl font-black font-headline text-white tracking-tighter">ALIEN</span>
              <p className="text-gray-500 text-sm mt-4 tracking-wide">Redefine Your Limits.</p>
            </div>
            <div className="text-left">
              <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-white">Quick Links</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/store" className="hover:text-primary-fixed transition-colors">Store</Link></li>
                <li><Link to="/login" className="hover:text-primary-fixed transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary-fixed transition-colors">Register</Link></li>
                <li><Link to="/plans" className="hover:text-primary-fixed transition-colors">Plans</Link></li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-white">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary-fixed" /> 06 21 01 09 78</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary-fixed" /> kachkachmouataz@gmail.com</li>
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary-fixed" /> Asilah tanger medina qdima </li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-white">Hours</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex justify-between"><span>Mon - Fri:</span> <span className="text-white">24 Hours</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span className="text-white">12 Hours</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span className="text-white">12 Hours</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-xs tracking-wide">© 2026 ALIEN Performance. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-primary-fixed/40 z-50"
      >
        <svg className="w-7 h-7 text-on-primary-fixed" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
};

export default Home;
