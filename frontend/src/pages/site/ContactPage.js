import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Loader2, ExternalLink } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Open mailto link as fallback
    const subject = encodeURIComponent(`Inquiry from ${form.name} - ${form.organization}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nOrganization: ${form.organization}\n\n${form.message}`);
    window.location.href = `mailto:tjamison@psbydesign.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="pt-[72px]" data-testid="contact-page">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-4">Get in Touch</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-[#0F2B3C]">
              Let's start a conversation
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
              Schedule a complimentary consultation to discuss how we can help your organization raise the bar.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-[#0F2B3C] mb-6">Contact Information</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[#0B7A6F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Email</p>
                    <a href="mailto:tjamison@psbydesign.com" className="text-sm text-slate-500 hover:text-[#0B7A6F] transition-colors">
                      tjamison@psbydesign.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#0B7A6F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Location</p>
                    <p className="text-sm text-slate-500">Atlanta, Georgia</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-xl bg-[#0F2B3C]">
                <p className="text-sm font-semibold text-white mb-2">Prefer to schedule directly?</p>
                <p className="text-xs text-slate-400 mb-4">Book a complimentary 60-minute consultation via Calendly.</p>
                <a
                  href="https://calendly.com/tjamison-1/60min"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="calendly-link"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B7A6F] text-white text-sm font-semibold hover:bg-[#096B62] transition-colors"
                >
                  Open Calendly <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F2B3C] mb-2">Message sent</h3>
                  <p className="text-sm text-slate-500">Your email client should have opened. We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                      <Input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        required
                        data-testid="contact-name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="name@company.com"
                        required
                        data-testid="contact-email"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Organization</Label>
                    <Input
                      value={form.organization}
                      onChange={e => setForm({ ...form, organization: e.target.value })}
                      placeholder="Your organization"
                      data-testid="contact-org"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Message</Label>
                    <Textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your goals and how we can help..."
                      required
                      data-testid="contact-message"
                      className="min-h-[140px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    data-testid="contact-submit"
                    className="h-11 px-8 bg-[#0B7A6F] hover:bg-[#096B62] text-white font-semibold"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Message <Send size={14} className="ml-2" /></>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
