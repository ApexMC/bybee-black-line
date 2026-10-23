export const quoteServiceNames = [
  "Interior detailing",
  "Exterior detailing",
  "Paint correction & protection",
] as const;

export type QuoteRequest = {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  services: string[];
  notes: string;
};

export function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]+$/.test(value) && !/[\x00-\x1f\x7f]/.test(value);
}

export function validateQuote(data: unknown): { quote: QuoteRequest; error?: never } | { quote?: never; error: string } {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "Please check your quote request and try again." };
  }
  const fields = data as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const name = text("name");
  const email = text("email");
  const phone = text("phone");
  const vehicle = text("vehicle");
  const notes = text("notes");

  if (!name || name.length > 100 || /[\r\n\x00]/.test(name)) return { error: "Please enter your name (up to 100 characters)." };
  if (!isEmail(email)) return { error: "Please enter a valid email address so we can reply." };
  if (fields.phone !== undefined && typeof fields.phone !== "string") return { error: "Please enter a valid phone number or leave it blank." };
  if (phone && (phone.length > 32 || !/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15)) return { error: "Please enter a valid phone number or leave it blank." };
  if (!vehicle || vehicle.length > 120 || /[\r\n\x00]/.test(vehicle)) return { error: "Please enter your vehicle (up to 120 characters)." };
  if ((fields.notes !== undefined && typeof fields.notes !== "string") || notes.length > 800) return { error: "Please keep additional details under 800 characters." };
  if (!Array.isArray(fields.services) || fields.services.length > quoteServiceNames.length || fields.services.some((service) => typeof service !== "string" || !quoteServiceNames.includes(service as typeof quoteServiceNames[number]))) {
    return { error: "Please choose services from the available options." };
  }

  return { quote: { name, email, phone, vehicle, services: [...new Set(fields.services as string[])], notes } };
}
