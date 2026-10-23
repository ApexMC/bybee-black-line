"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, ArrowRight, Menu, X, Phone, MapPin, Sparkles, ShieldCheck, Check, Droplets } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { quoteServiceNames } from "@/lib/quote";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FinishStudio = dynamic(() => import("@/components/finish-studio").then((module) => module.FinishStudio), { ssr: false, loading: () => <div className="finish-studio studio-loading"><span className="eyebrow">LOADING CAR VIEW</span></div> });
const services = [
  { number: "01", name: quoteServiceNames[0], description: "Vacuuming and cleaning for seats, carpets, cabin surfaces, interior glass, and trunk.", image: "/images/interior.jpg", imageAlt: "Sports car interior", imageClass: "interior", comingSoon: false, icon: Sparkles, includes: ["Vacuuming and surface cleaning", "Seat, carpet, and high-touch area cleaning", "Interior glass cleaning"] },
  { number: "02", name: quoteServiceNames[1], description: "Exterior washing and decontamination, including wheels, tires, trim, and glass.", image: "/images/car-detail.jpg", imageAlt: "Silver sports car exterior", imageClass: "exterior", comingSoon: true, icon: Droplets, includes: ["Exterior wash and decontamination", "Wheel, tire, and trim cleaning", "Exterior glass cleaning"] },
  { number: "03", name: quoteServiceNames[2], description: "Paint assessment, swirl correction options, and protection suited to your vehicle.", image: "/images/paint.jpg", imageAlt: "Silver paintwork", imageClass: "paint", comingSoon: true, icon: ShieldCheck, includes: ["Paint condition assessment", "Correction options for swirls and imperfections", "Paint protection recommendations"] },
];
const faqs = [
  ["Which service should I choose?", "Send us your vehicle details and what you’d like cleaned or corrected. We’ll recommend a service based on its condition."],
  ["How do I book?", "Request a quote or call either number below. We’ll confirm the service, price, and appointment time with you."],
  ["What areas do you serve?", "Louisville, Kentucky and Southern Indiana. Contact us to confirm arrangements for your location."],
  ["How much does detailing cost?", "Prices depend on your vehicle’s size, condition, and selected services. Request a quote before scheduling."],
  ["How should I prepare my vehicle?", "Remove personal belongings and valuables. We’ll confirm any other preparation when you book."],
];

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? "footer-brand" : ""}`} href="#home" aria-label="Bybee Black Line home"><span className="brand-symbol"><img src="/images/bybee-logo.png" alt="" /></span><span className="brand-words"><strong>BYBEE <span>BLACK LINE</span></strong><small>AUTO DETAILING</small></span></a>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [serviceDetail, setServiceDetail] = useState<number | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);

  function openQuote(service?: string) {
    setSelected(service ? [service] : []);
    setQuoteOpen(true); setMenuOpen(false);
  }

  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#services">Services</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></nav>
        <div className="header-actions"><Button size="sm" className="header-quote" onClick={() => openQuote()}>Get a quote <ArrowUpRight /></Button><button className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[["Services", "#services"], ["FAQ", "#faq"], ["Contact", "#contact"]].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={18} /></a>)}<a href="tel:+18126082336">(812) 608-2336 <Phone size={16} /></a></nav>}
    </header>

    <main id="main">
      <section id="home" className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline"><span><MapPin size={12} /> LOUISVILLE, KY & SOUTHERN INDIANA</span></div>
        <FinishStudio />
        <div className="hero-content">
          <h1>NOVELTY,<br /><span>RESTORED.</span></h1>
          <p className="hero-description">Exquisite interior detailing,<br />exterior detailing, paint correction, and protection coming soon.</p>
          <div className="hero-buttons"><Button size="lg" onClick={() => openQuote()}>Get a quote <ArrowUpRight /></Button><a href="#services" className="text-link">View services <ArrowRight size={15} /></a></div>
        </div>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading"><h2>SERVICES</h2></div>
        <div className="services-grid">{services.map((service, index) => <article className="service-card" key={service.number}>
          <button className="service-image-button" onClick={() => setServiceDetail(index)} aria-label={`View ${service.name.toLowerCase()} details${service.comingSoon ? " (coming soon)" : ""}`}><div className={`service-image ${service.imageClass}`}><img src={service.image} alt={service.imageAlt} loading="lazy" /><span className="service-number">{service.number} <span>/</span></span><span className="service-icon"><service.icon size={20} strokeWidth={1.4} /></span>{service.comingSoon && <span className="service-coming-soon">Coming Soon</span>}</div></button>
          <div className="service-copy"><h3>{service.name}</h3><p>{service.description}</p><button className="service-link" onClick={() => setServiceDetail(index)}>View details <ArrowUpRight size={17} /></button></div>
        </article>)}</div>
      </section>

      <section id="faq" className="section faq-section"><div className="faq-intro"><h2>FAQ</h2></div><Accordion type="single" collapsible className="faq-accordion">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent>{answer}</AccordionContent></AccordionItem>)}</Accordion></section>

      <section id="contact" className="contact-section"><div className="contact-main"><h2>GET A QUOTE</h2><div className="contact-right"><p>Send your vehicle details for pricing and availability.</p><Button size="lg" onClick={() => openQuote()}>Request a quote <ArrowUpRight /></Button></div></div><div className="contact-bottom"><span>CALL US</span><a href="tel:+18126082336"><Phone size={15} />(812) 608-2336 <ArrowUpRight size={14} /></a><a href="tel:+18126082047"><Phone size={15} />(812) 608-2047 <ArrowUpRight size={14} /></a></div></section>
    </main>

    <footer className="site-footer"><div className="footer-main"><Brand footer /><a href="#home">BACK TO TOP <ArrowUpRight size={14} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Bybee Black Line Auto Detailing.</span><span>Louisville, KY / Southern Indiana</span><button onClick={() => setCreditsOpen(true)}>Site credits</button></div></footer>

    <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}><DialogContent><QuoteForm initialServices={selected} onClose={() => setQuoteOpen(false)} /></DialogContent></Dialog>

    <Dialog open={serviceDetail !== null} onOpenChange={(open) => { if (!open) setServiceDetail(null); }}><DialogContent>{serviceDetail !== null && <><DialogTitle>{services[serviceDetail].name}</DialogTitle><DialogDescription>Service options</DialogDescription><ul className="service-includes">{services[serviceDetail].includes.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul><p className="service-modal-note">We’ll confirm the scope, price, and availability after discussing your vehicle.</p><Button className="w-full" onClick={() => { const service = services[serviceDetail].name; setServiceDetail(null); openQuote(service); }}>Request a quote <ArrowUpRight /></Button></>}</DialogContent></Dialog>

    <Dialog open={creditsOpen} onOpenChange={setCreditsOpen}><DialogContent><DialogTitle>Site credits</DialogTitle><DialogDescription>Branding supplied by Bybee Black Line. Photos from Unsplash and the 3D model are illustrative, not examples of customer work.</DialogDescription><p className="credits-text">“Ferrari 458 Italia” 3D model by <a href="https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6" target="_blank" rel="noreferrer">vicent091036</a>, used under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>, via Three.js. Materials, lighting, and presentation modified. No affiliation with the vehicle manufacturer.</p></DialogContent></Dialog>
  </>;
}
