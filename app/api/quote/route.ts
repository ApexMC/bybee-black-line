import { createHash } from "node:crypto";
import { validateQuote } from "@/lib/quote";
import { sendQuoteEmail } from "@/lib/quote-email";

export const runtime = "nodejs";

const maxBodyBytes = 12_000;
const windowMs = 15 * 60 * 1000;
// A small per-process throttle; hosting-level limits can cover multiple instances.
const attempts = new Map<string, { count: number; expires: number }>();

function reply(data: Record<string, unknown>, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > maxBodyBytes) throw new Error("too-large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid-json");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new Error("too-large");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js can construct request.url from its internal listener hostname.
  // Use the public request headers, including those set by a reverse proxy.
  const url = new URL(request.url);
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host).split(",")[0].trim();
  const protocol = (request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)).split(",")[0].trim();
  if ((origin && origin !== `${protocol}://${host}`) || request.headers.get("sec-fetch-site") === "cross-site") {
    return reply({ error: "Please submit your request from our website." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply({ error: "Please submit a valid quote request." }, 415);
  }

  let data: unknown;
  try {
    data = await readBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "too-large";
    return reply({ error: tooLarge ? "Your request is too long. Please shorten the details and try again." : "Please submit a valid quote request." }, tooLarge ? 413 : 400);
  }

  // Bots that fill this hidden field receive no indication that they were blocked.
  if (data && typeof data === "object" && "website" in data && data.website) return reply({ success: true });
  const result = validateQuote(data);
  if (!result.quote) return reply({ error: result.error }, 400);

  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  const key = createHash("sha256").update(result.quote.email.toLowerCase()).digest("hex");
  const recent = attempts.get(key);
  if ((recent && recent.count >= 3) || (!recent && attempts.size >= 10_000)) {
    return reply({ error: "Please wait a few minutes before sending another request, or give us a call." }, 429);
  }
  attempts.set(key, { count: (recent?.count || 0) + 1, expires: recent?.expires || now + windowMs });

  try {
    await sendQuoteEmail(result.quote);
    return reply({ success: true });
  } catch (error) {
    // Log only the error category; SMTP errors can contain addresses or credentials.
    console.error("Quote email failed", { code: error && typeof error === "object" && "code" in error ? String(error.code) : "EMAIL_UNAVAILABLE" });
    return reply({ error: "We couldn’t send your request. Please try again or call (812) 608-2336." }, 503);
  }
}
