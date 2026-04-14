import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Industries', path: '/industries' },
  { label: 'Clarity', path: '/clarity' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
      data-testid="psd-navbar"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="psd-logo-link">
            <img
              src="https://psbydesign.com/wp-content/uploads/2021/07/Logo-Transparent-1024x211.png"
              alt="Performance Solutions by Design"
              className="h-10 sm:h-11 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium tracking-wide transition-colors ${
                    active
                      ? 'text-[#0B7A6F] bg-[#0B7A6F]/[0.06]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/clarity/app"
              data-testid="nav-clarity-login"
              className="ml-3 px-5 py-2 rounded-md bg-[#0B7A6F] text-white text-[13px] font-semibold tracking-wide hover:bg-[#096B62] transition-colors"
            >
              Clarity Login
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-50"
            data-testid="mobile-nav-toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <nav className="px-5 py-4 space-y-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-[#0B7A6F] bg-[#0B7A6F]/[0.06]' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/clarity/app"
              className="block px-4 py-3 mt-2 rounded-lg bg-[#0B7A6F] text-white text-sm font-semibold text-center"
            >
              Clarity Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
