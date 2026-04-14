import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Briefcase, Users, BookOpen, GraduationCap,
  Building2, Heart, Car, Scale, Laptop, ShoppingBag, Factory, UtensilsCrossed, TreePine
} from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1758518727707-b023e285b709?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxleGVjdXRpdmUlMjBjb25zdWx0aW5nJTIwcHJvZmVzc2lvbmFsJTIwdGVhbSUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzc2MjA2MjE0fDA&ixlib=rb-4.1.0&q=85';

const SERVICES = [
  { icon: Briefcase, title: 'Consulting Services', desc: 'In-depth gap analysis to pinpoint and resolve barriers to an extraordinary customer experience.' },
  { icon: Users, title: 'Executive Coaching', desc: 'One-on-one leadership development focused on six key competencies for organizational impact.' },
  { icon: BookOpen, title: 'Workshops & Webinars', desc: 'Engaging sessions designed to create awareness, build skills, and foster sustainable change.' },
  { icon: GraduationCap, title: 'Learning Resources', desc: 'Customizable guides, checklists, and micro-learning tools that drive real-world results.' },
];

const PRINCIPLES = [
  'Define your vision of excellence',
  'Create alignment across leadership',
  'Build service standards that stick',
  'Develop people at every level',
  'Measure what matters most',
  'Sustain a culture of excellence',
];

const INDUSTRIES = [
  { icon: Car, name: 'Automotive' },
  { icon: Scale, name: 'Financial & Legal' },
  { icon: Heart, name: 'Healthcare' },
  { icon: UtensilsCrossed, name: 'Hospitality' },
  { icon: ShoppingBag, name: 'Luxury Retail' },
  { icon: Factory, name: 'Manufacturing' },
  { icon: TreePine, name: 'Private Clubs' },
  { icon: Laptop, name: 'Technology' },
];

export default function HomePage() {
  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative pt-[72px] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-4">
                Performance Solutions by Design
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-[#0F2B3C]">
                Raising the bar from average to{' '}
                <span className="text-[#0B7A6F]">extraordinary</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-md">
                We help leaders and organizations elevate leadership, service standards, and customer experience through customized consulting, coaching, and learning solutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  data-testid="hero-cta-primary"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0B7A6F] text-white text-sm font-semibold hover:bg-[#096B62] transition-colors"
                >
                  Schedule Consultation <ArrowRight size={16} />
                </Link>
                <Link
                  to="/services"
                  data-testid="hero-cta-secondary"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src={HERO_IMG} alt="Executive consulting team" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-slate-100 hidden md:block">
                <p className="text-2xl font-semibold text-[#0F2B3C]">20+</p>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Strip */}
      <section className="bg-[#F8FAFB] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '2003', label: 'Founded' },
              { num: '500+', label: 'Leaders Coached' },
              { num: '50+', label: 'Organizations Served' },
              { num: '10+', label: 'Industries' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-semibold text-[#0F2B3C] tracking-tight">{s.num}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Our Solutions</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C]">
              Comprehensive solutions for organizational excellence
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group p-6 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  data-testid={`service-card-${i}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0B7A6F]/[0.08] flex items-center justify-center mb-5 group-hover:bg-[#0B7A6F]/[0.12] transition-colors">
                    <Icon size={20} className="text-[#0B7A6F]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F2B3C] mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link to="/services" className="text-sm text-[#0B7A6F] hover:text-[#096B62] font-medium inline-flex items-center gap-1.5 transition-colors">
              View all services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why PSD */}
      <section className="bg-[#F8FAFB] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Our Methodology</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-6">
                The Six Principles of Service Excellence
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                At the core of everything we do is a proven methodology for creating and sustaining a culture of excellence, drawn from renowned benchmark organizations including The Ritz-Carlton Hotel Company.
              </p>
              <ul className="space-y-3">
                {PRINCIPLES.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#0B7A6F] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1758518730037-a16581a040e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwyfHxsZWFkZXJzaGlwJTIwY29hY2hpbmclMjBwcm9mZXNzaW9uYWwlMjBkZXZlbG9wbWVudCUyMGNvcnBvcmF0ZXxlbnwwfHx8fDE3NzYyMDYyMTV8MA&ixlib=rb-4.1.0&q=85"
                  alt="Business professionals in strategy meeting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Cross-Industry Expertise</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C]">
              We serve organizations of every size and sector
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {INDUSTRIES.map(({ icon: Icon, name }) => (
              <div key={name} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow">
                <Icon size={18} className="text-[#0B7A6F] shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium text-slate-700">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/industries" className="text-sm text-[#0B7A6F] font-medium hover:text-[#096B62] inline-flex items-center gap-1.5 transition-colors">
              View all industries <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Clarity Teaser */}
      <section className="bg-[#0F2B3C] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0EB5A5] font-semibold mb-3">
              Introducing
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
              Clarity
            </h2>
            <p className="text-sm text-[#0EB5A5] font-medium mb-6">
              A Performance Solution by Design
            </p>
            <p className="text-base text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
              A structured 10-session executive coaching platform that extends our consulting philosophy into a digital experience. Track progress, access resources, and engage with your coach — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/clarity"
                data-testid="clarity-learn-more"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0B7A6F] text-white text-sm font-semibold hover:bg-[#096B62] transition-colors"
              >
                Learn More <ArrowRight size={16} />
              </Link>
              <Link
                to="/clarity/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.08] border border-white/10 text-white text-sm font-semibold hover:bg-white/[0.12] transition-colors"
              >
                Access Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-4">
            Ready to raise the bar?
          </h2>
          <p className="text-base text-slate-500 max-w-lg mx-auto mb-8">
            Schedule a complimentary consultation and discover how we can help your organization achieve extraordinary results.
          </p>
          <Link
            to="/contact"
            data-testid="cta-contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#0B7A6F] text-white font-semibold hover:bg-[#096B62] transition-colors"
          >
            Schedule Free Consultation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
