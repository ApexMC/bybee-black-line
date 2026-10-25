import nodemailer from "nodemailer";
import { isEmail, type QuoteRequest } from "./quote";

export async function sendQuoteEmail(quote: QuoteRequest) {
  const host = process.env.SMTP_HOST?.trim() || "smtp.resend.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER?.trim() || "resend";
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.QUOTE_FROM_EMAIL?.trim();
  const to = process.env.QUOTE_TO_EMAIL?.trim();

  if (!password || !from || !to || !isEmail(from) || !isEmail(to) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Quote email is not configured. Check SMTP and quote email environment variables.");
  }

  const secure = port === 465 || port === 2465;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  const result = await transport.sendMail({
    from: { name: "Bybee Blackline", address: from },
    to,
    replyTo: { name: quote.name, address: quote.email },
    subject: `Detailing quote request: ${quote.vehicle}`,
    text: [
      "New quote request from the Bybee Blackline website",
      "",
      `Name: ${quote.name}`,
      `Email: ${quote.email}`,
      `Phone: ${quote.phone || "Not provided"}`,
      "",
      `Vehicle: ${quote.vehicle}`,
      `Services: ${quote.services.length ? quote.services.join(", ") : "Help choosing a service"}`,
      "",
      "Additional details:",
      quote.notes || "None provided",
    ].join("\n"),
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  if (!result.accepted?.length || result.rejected?.length) {
    throw new Error("The mail server did not accept the quote email.");
  }
}
