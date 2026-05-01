import { Link } from 'react-router-dom';
import { Linkedin, Youtube, Facebook, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F2B3C] text-white" data-testid="psd-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="https://psbydesign.com/wp-content/uploads/2021/07/Logo-Transparent-1024x211.png"
              alt="Performance Solutions by Design"
              className="h-10 w-auto mb-5 brightness-200"
            />
            <p className="text-sm text-slate-400 leading-relaxed">
              Helping leaders and organizations elevate the customer experience from average to extraordinary since 2003.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold mb-5">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'About', path: '/about' },
                { label: 'Services', path: '/services' },
                { label: 'Industries', path: '/industries' },
                { label: 'CLARITY', path: '/clarity' },
                { label: 'Contact', path: '/contact' },
              ].map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail size={14} className="shrink-0 text-[#0B7A6F]" />
                <a href="mailto:tjamison@psbydesign.com" className="hover:text-white transition-colors">
                  tjamison@psbydesign.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin size={14} className="shrink-0 text-[#0B7A6F]" />
                Atlanta, Georgia
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold mb-5">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/performance-solutions-by-design/' },
                { icon: Youtube, href: 'https://www.youtube.com/theogilbertjamison' },
                { icon: Facebook, href: 'https://www.facebook.com/PerformanceSolutionsbyDesign/' },
                { icon: Twitter, href: 'https://twitter.com/theojamison' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Performance Solutions by Design, Inc. All rights reserved.
          </p>
          <Link to="/clarity/app" className="text-xs text-[#0B7A6F] hover:text-[#0EB5A5] font-medium transition-colors">
            CLARITY Platform Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
