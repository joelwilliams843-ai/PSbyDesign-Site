import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Award, Target, Compass, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-[72px]" data-testid="about-page">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-4">About Us</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-[#0F2B3C]">
              Raising the Bar Since 2003
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
              Headquartered in Atlanta, Georgia, Performance Solutions by Design is the leading provider of service excellence, customer experience, and leadership development tools and resources.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Our Founder</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F2B3C] mb-6">
                Theo Gilbert-Jamison
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Author, consultant, keynote speaker, and executive coach. Theo is the founder of Performance Solutions by Design and a recognized thought leader in service excellence and customer experience.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Prior to launching her company, Theo served as Vice President of Learning & Development for The Ritz-Carlton Hotel Company, where she helped shape the world-renowned service culture that became a global benchmark for excellence.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Drawing from over two decades of experience, she brings a unique combination of corporate leadership expertise and entrepreneurial vision to every engagement.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-[#e8edef]">
                <img
                  src="https://customer-assets.emergentagent.com/job_progress-hub-204/artifacts/i5cpmyvp_Slide1.JPG"
                  alt="Theo Gilbert-Jamison, Founder of Performance Solutions by Design"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F8FAFB] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Our Approach</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F2B3C]">
              What drives us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Excellence', desc: 'We believe excellence is not a destination but a continuous journey of improvement.' },
              { icon: Target, title: 'Precision', desc: 'Our gap analysis methodology pinpoints exactly where organizations need to focus.' },
              { icon: Compass, title: 'Strategy', desc: 'Every engagement starts with a clear, customized strategy tailored to your goals.' },
              { icon: Lightbulb, title: 'Sustainability', desc: 'We build solutions designed for lasting impact, not temporary fixes.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-white rounded-xl border border-slate-100">
                <Icon size={22} className="text-[#0B7A6F] mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-[#0F2B3C] mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-3">Client Perspectives</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F2B3C]">
              Trusted by leaders across industries
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: 'Theo is an exceptional consultant with knowledge of the hospitality industry. She engaged our team and generated excitement and commitment to the Service Excellence Program that still exists today.', name: 'Brenda Lazarus', title: 'Former SVP, Human Resources, Reynolds Lake Oconee' },
              { quote: 'Theo is a captivating speaker and all team members who meet her are mesmerized by her passion and insight. Her message resonates with all levels of staff, from the front-line to the C-Suite.', name: 'Joanne O. Miller, DNP, RN', title: 'Chief Nurse Executive, Carson Tahoe Health System' },
              { quote: 'Theo consistently proposes the perfect solution and implements it on schedule for businesses, and each of our employees is better for knowing her.', name: 'Stan Waterhouse', title: 'CEO, CSW Advisory, LLC' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-100 bg-white">
                <p className="text-sm text-slate-600 leading-relaxed italic mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-[#0F2B3C]">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F2B3C] py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            When it comes to raising the bar, you can count on us.
          </h2>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#0B7A6F] text-white font-semibold hover:bg-[#096B62] transition-colors"
          >
            Schedule Free Consultation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
