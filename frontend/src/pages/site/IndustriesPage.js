import { Link } from 'react-router-dom';
import {
  ArrowRight, Car, Scale, GraduationCap, Heart, UtensilsCrossed,
  ShoppingBag, Factory, TreePine, Laptop, Building2
} from 'lucide-react';

const INDUSTRIES = [
  { icon: Car, name: 'Automotive', desc: 'Elevating the dealership and service experience for discerning customers who expect more.' },
  { icon: Scale, name: 'Financial & Legal Services', desc: 'Building trust-driven client relationships through exceptional service standards.' },
  { icon: GraduationCap, name: 'Education', desc: 'Creating environments of excellence that inspire students, parents, and staff alike.' },
  { icon: Heart, name: 'Healthcare', desc: 'Improving patient experience and staff engagement in clinical and administrative settings.' },
  { icon: UtensilsCrossed, name: 'Hospitality', desc: 'Drawing from Ritz-Carlton-level expertise to set new standards for guest experience.' },
  { icon: ShoppingBag, name: 'Luxury Retail', desc: 'Crafting memorable customer journeys for brands that demand extraordinary service.' },
  { icon: Factory, name: 'Manufacturing', desc: 'Driving operational excellence and internal customer service across production teams.' },
  { icon: TreePine, name: 'Private Clubs', desc: 'Enhancing member experience with service cultures built on exclusivity and care.' },
  { icon: Laptop, name: 'Technology', desc: 'Helping tech companies translate innovation into exceptional client service delivery.' },
  { icon: Building2, name: 'And More', desc: 'Our methodology adapts to any industry. If you serve customers, we can help you serve them better.' },
];

export default function IndustriesPage() {
  return (
    <div className="pt-[72px]" data-testid="industries-page">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-4">Industries</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-[#0F2B3C]">
              Cross-industry expertise, customized execution
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
              We help organizations of every size and sector implement solutions that achieve rapid results in elevating the customer experience.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map(({ icon: Icon, name, desc }, i) => (
              <div
                key={name}
                className="group p-6 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                data-testid={`industry-card-${i}`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#0B7A6F]/[0.08] flex items-center justify-center mb-5 group-hover:bg-[#0B7A6F]/[0.12] transition-colors">
                  <Icon size={20} className="text-[#0B7A6F]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-[#0F2B3C] mb-2">{name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F2B3C] py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
            No matter your industry, we can help you raise the bar
          </h2>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#0B7A6F] text-white font-semibold hover:bg-[#096B62] transition-colors"
          >
            Schedule Consultation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
