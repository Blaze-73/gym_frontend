import { Link } from 'react-router-dom';
import { Dumbbell, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-high border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-black font-headline text-white tracking-widest">ALIEN</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Elite performance training system designed for athletes who demand the extraordinary.
              Transform your potential into reality.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-fixed/20 hover:text-primary-fixed transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-fixed/20 hover:text-primary-fixed transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-fixed/20 hover:text-primary-fixed transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-fixed/20 hover:text-primary-fixed transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-gray-400 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/plans" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Join Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-gray-400 mb-6">Programs</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/programs" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Personal Training
                </Link>
              </li>
              <li>
                <Link to="/nutrition" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Nutrition Plans
                </Link>
              </li>
              <li>
                <Link to="/coaches" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Elite Coaches
                </Link>
              </li>
              <li>
                <Link to="/workout" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Workout Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-gray-400 mb-6">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <Dumbbell className="w-5 h-5 text-primary-fixed flex-shrink-0 mt-0.5" />
                <span>Elite Fitness Tanger Ismontic<br />Performance Zone 42</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary-fixed">📞</span>
                <a href="tel:06 43 43 54 89" className="hover:text-white transition-colors">
                  +212 6 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary-fixed">✉️</span>
                <a href="mailto:info@alien-fitness.com" className="hover:text-white transition-colors break-all">
                  info@alien-fitness.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 ALIEN Performance System. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;