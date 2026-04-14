import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';

const SERVICES = [
  {
    icon: Briefcase,
    title: 'Consulting Services',
    subtitle: 'Gap Analysis & Strategy',
    desc: 'We offer an in-depth Six Principles Gap Analysis designed to help you assess and pinpoint specific issues that are inhibiting your team from raising the bar in all aspects of the customer experience.',
    features: ['Six Principles Gap Analysis', 'Custom strategy development', 'Implementation roadmap', 'Ongoing advisory support'],
  },
  {
    icon: Users,
    title: 'Executive Coaching',
    subtitle: 'Leadership Development',
    desc: 'Professional development for leaders through personal, one-on-one coaching that focuses on increasing business acumen and effectiveness in six key leadership competencies.',
    features: ['1:1 leadership coaching', 'Six competency framework', '360 leadership assessments', 'Structured 10-session programs'],
  },
  {
    icon: BookOpen,
    title: 'Workshops & Webinars',
    subtitle: 'Team Development',
    desc: 'A comprehensive library of informative, engaging workshops, webinars, and keynote presentations designed to create awareness and foster sustainable change across your organization.',
    features: ['Custom workshop design', 'Keynote presentations', 'Virtual & in-person delivery', 'Train-the-trainer programs'],
  },
  {
    icon: GraduationCap,
    title: 'Learning Resources',
    subtitle: 'Tools & Materials',
    desc: 'An array of highly effective resource guides, cheat sheets, accountability checklists, and micro-learning videos that can be customized to meet your unique organizational needs.',
    features: ['Resource guides', 'Accountability checklists', 'Micro-learning videos', 'Customizable content'],
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-[72px]" data-testid="services-page">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-4">Our Services</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-[#0F2B3C]">
              Customized solutions for extraordinary results
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
              We provide a comprehensive suite of consulting, coaching, and training solutions designed to help your organization achieve and sustain a culture of excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const reversed = i % 2 === 1;
            return (
              <div
                key={s.title}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reversed ? 'lg:direction-rtl' : ''}`}
                data-testid={`service-section-${i}`}
              >
                <div className={reversed ? 'lg:order-2' : ''}>
                  <div className="w-12 h-12 rounded-xl bg-[#0B7A6F]/[0.08] flex items-center justify-center mb-5">
                    <Icon size={24} className="text-[#0B7A6F]" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs text-[#0B7A6F] font-semibold uppercase tracking-wider mb-1">{s.subtitle}</p>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C] mb-4">{s.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2.5">
                    {s.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#0B7A6F] shrink-0" />
                        <span className="text-sm text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${reversed ? 'lg:order-1' : ''} aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#0B7A6F]/5 to-[#0F2B3C]/5 flex items-center justify-center`}>
                  <Icon size={64} className="text-[#0B7A6F]/20" strokeWidth={0.5} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F2B3C] py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
            Let's design the right solution for your organization
          </h2>
          <p className="text-base text-slate-400 mb-8 max-w-lg mx-auto">
            Every organization is unique. Schedule a consultation so we can understand your needs and create a customized plan.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#0B7A6F] text-white font-semibold hover:bg-[#096B62] transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
