"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { quoteServiceNames } from "@/lib/quote";

export function QuoteForm({ initialServices, onClose }: { initialServices: string[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [selected, setSelected] = useState(initialServices);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const submitting = status === "submitting";

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const website = new FormData(event.currentTarget).get("website") || "";
    inFlight.current = true;
    setStatus("submitting");
    setError("");
    try {
      const response = await fetch("/api/quote/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, vehicle, services: selected, notes, website }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(typeof result.error === "string" ? result.error : "We couldn’t send your request. Please try again or call (812) 608-2336.");
      }
      setStatus("sent");
    } catch (error) {
      setError(error instanceof Error && !(error instanceof TypeError) && !(error instanceof SyntaxError) ? error.message : "We couldn’t send your request. Please check your connection and try again, or call (812) 608-2336.");
      setStatus("idle");
    } finally {
      inFlight.current = false;
    }
  }

  return <>
    <DialogTitle>{status === "sent" ? "REQUEST SENT" : "REQUEST A QUOTE"}</DialogTitle>
    <DialogDescription>{status === "sent" ? `Thanks, ${name.trim()}. We’ll reply to ${email.trim()} with pricing and availability.` : "Tell us about your vehicle. We’ll respond with pricing and availability."}</DialogDescription>
    {status === "sent" ? <div className="quote-ready">
      <p className="quote-success" role="status"><Check size={18} /> Your quote request has been sent.</p>
      <p className="form-note">Pricing and appointments are confirmed directly with our team.</p>
      <Button type="button" className="w-full" onClick={onClose}>Done <Check /></Button>
    </div> : <form className="quote-form" onSubmit={submitQuote} aria-busy={submitting} aria-describedby={error ? "quote-error" : undefined}>
      <label htmlFor="quote-name">Your name <span>*</span></label>
      <input id="quote-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} />
      <label htmlFor="quote-email">Email address <span>*</span></label>
      <input id="quote-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting} />
      <label htmlFor="quote-phone">Phone number <span className="optional">Optional</span></label>
      <input id="quote-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} disabled={submitting} />
      <label htmlFor="quote-vehicle">What do you drive? <span>*</span></label>
      <input id="quote-vehicle" name="vehicle" required maxLength={120} placeholder="e.g. 2022 Ford F-150" value={vehicle} onChange={(event) => setVehicle(event.target.value)} disabled={submitting} />
      <fieldset disabled={submitting}><legend>What are you interested in?</legend>{quoteServiceNames.map((service) => <label key={service} className="service-checkbox"><input type="checkbox" name="services" value={service} checked={selected.includes(service)} onChange={(event) => setSelected(event.target.checked ? [...selected, service] : selected.filter((name) => name !== service))} /><span>{service}</span></label>)}</fieldset>
      <label htmlFor="quote-notes">Anything we should know? <span className="optional">Optional</span></label>
      <textarea id="quote-notes" name="notes" rows={3} maxLength={800} placeholder="Vehicle condition, your location, or what you’d like to improve…" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={submitting} />
      <div className="quote-honeypot" aria-hidden="true"><label htmlFor="quote-website">Website</label><input id="quote-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {error && <p id="quote-error" className="form-error" role="alert">{error}</p>}
      <Button className="w-full" type="submit" disabled={submitting}>{submitting ? <>Sending request… <LoaderCircle className="animate-spin" /></> : <>Send quote request <ArrowRight /></>}</Button>
      <p className="form-note">We’ll use your contact details to respond to your request. Pricing and appointments are confirmed with our team.</p>
    </form>}
    <div className="quote-call-options"><span>Prefer to call?</span><a href="tel:+18126082336">(812) 608-2336</a><a href="tel:+18126082047">(812) 608-2047</a></div>
  </>;
}
