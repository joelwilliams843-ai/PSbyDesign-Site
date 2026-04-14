import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, FolderOpen, CalendarClock, Users,
  CheckCircle2, Shield, Laptop, Smartphone
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: '10-Session Progress Tracker', desc: 'Visual dashboard tracking completion across the structured coaching program.' },
  { icon: FolderOpen, title: 'Resource Hub', desc: 'Centralized access to assessments, guides, reports, and certificates.' },
  { icon: CalendarClock, title: 'Session Scheduling', desc: 'Request and manage coaching sessions with built-in approval workflows.' },
  { icon: Users, title: 'Community Engagement', desc: 'Share leadership best practices and insights with fellow participants.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Role-based access with full data isolation between participants.' },
  { icon: Laptop, title: 'Works Everywhere', desc: 'Responsive design that works seamlessly on desktop, tablet, and mobile.' },
];

const BENEFITS = [
  'Structured accountability across all 10 sessions',
  'Real-time visibility into coaching progress',
  'Secure document management for assessments and reports',
  'Streamlined scheduling and communication',
  'Digital certificate of completion',
  'Built on PSD\'s Six Principles methodology',
];

export default function ClarityLandingPage() {
  return (
    <div className="pt-[72px]" data-testid="clarity-landing-page">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-[#0F2B3C] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(11,122,111,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 mb-8">
              <img
                src="https://psbydesign.com/wp-content/uploads/2021/07/Logo-Transparent-1024x211.png"
                alt="PSD"
                className="h-4 w-auto brightness-200"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
              Clarity
            </h1>
            <p className="text-base sm:text-lg text-[#0EB5A5] font-medium mt-3 mb-6">
              A Performance Solution by Design
            </p>
            <p className="text-base text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
              The executive coaching platform that brings structure, visibility, and accountability to your leadership development journey.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                data-testid="clarity-cta-demo"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#0B7A6F] text-white text-sm font-semibold hover:bg-[#096B62] transition-colors"
              >
                Request a Demo <ArrowRight size={16} />
              </Link>
              <Link
                to="/clarity/app"
                data-testid="clarity-cta-login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white/[0.08] border border-white/10 text-white text-sm font-semibold hover:bg-white/[0.12] transition-colors"
              >
                Platform Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is Clarity */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">What is Clarity</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-6">
                Your coaching journey, structured and visible
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Clarity is a purpose-built digital platform that extends Performance Solutions by Design's executive coaching methodology into a structured, trackable experience.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Each participant moves through a 10-session program with clear milestones, dedicated resources, and direct access to their coach — all within a secure, branded environment.
              </p>
              <Link
                to="/contact"
                className="text-sm text-[#0B7A6F] hover:text-[#096B62] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                Learn how Clarity can work for your organization <ArrowRight size={14} />
              </Link>
            </div>
            {/* App Preview */}
            <div className="rounded-2xl bg-[#F8FAFB] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="aspect-[16/10] rounded-lg bg-white border border-slate-100 shadow-inner flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B7A6F]/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 size={28} className="text-[#0B7A6F]" />
                  </div>
                  <p className="text-lg font-semibold text-[#0F2B3C]">CLARITY</p>
                  <p className="text-xs text-slate-400 mt-1">Executive Coaching Dashboard</p>
                  <div className="mt-4 flex justify-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className={`w-5 h-1.5 rounded-full ${i < 4 ? 'bg-[#0B7A6F]' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">40% Program Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-[#F8FAFB] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Who It's For</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-12">
            Built for organizations that invest in their leaders
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { label: 'Executive Leaders', desc: 'C-suite and senior leaders developing strategic capabilities' },
              { label: 'HR & L&D Teams', desc: 'Teams managing leadership development programs at scale' },
              { label: 'Coaching Participants', desc: 'Individuals engaged in structured coaching programs' },
            ].map(t => (
              <div key={t.label}>
                <p className="text-sm font-semibold text-[#0F2B3C] mb-2">{t.label}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Platform Features</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C]">
              Everything you need in one place
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="p-6 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-testid={`clarity-feature-${i}`}>
                <Icon size={22} className="text-[#0B7A6F] mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-[#0F2B3C] mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0F2B3C] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#0EB5A5] font-semibold mb-3">Outcomes</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-8">
                Measurable impact on leadership development
              </h2>
              <ul className="space-y-4">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#0EB5A5] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <Smartphone size={48} className="text-[#0EB5A5]/40 mx-auto mb-3" />
                  <p className="text-xs text-slate-500">Works on any device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-4">
            Ready to bring Clarity to your coaching program?
          </h2>
          <p className="text-base text-slate-500 max-w-lg mx-auto mb-8">
            Contact us to schedule a demo and see how Clarity can transform your executive coaching experience.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#0B7A6F] text-white font-semibold hover:bg-[#096B62] transition-colors"
            >
              Request Demo <ArrowRight size={16} />
            </Link>
            <Link
              to="/clarity/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Access Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
