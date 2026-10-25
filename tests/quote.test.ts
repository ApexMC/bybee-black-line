import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type Mail from "nodemailer/lib/mailer";
import { POST } from "../app/api/quote/route";

const envKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "QUOTE_FROM_EMAIL", "QUOTE_TO_EMAIL"] as const;
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const sent: Mail.Options[] = [];
const transports: SMTPTransport.Options[] = [];
let sendError: Error | undefined;
let accepted = true;
let sequence = 0;

beforeEach(() => {
  Object.assign(process.env, {
    SMTP_HOST: "smtp.resend.com", SMTP_PORT: "465", SMTP_USER: "resend",
    SMTP_PASSWORD: "test-api-key", QUOTE_FROM_EMAIL: "quotes@bybee.example", QUOTE_TO_EMAIL: "team@bybee.example",
  });
  sent.length = 0;
  transports.length = 0;
  sendError = undefined;
  accepted = true;
  mock.method(nodemailer, "createTransport", ((options: SMTPTransport.Options) => {
    transports.push(options);
    return { sendMail: async (mail: Mail.Options) => {
      if (sendError) throw sendError;
      sent.push(mail);
      return { accepted: accepted ? ["team@bybee.example"] : [], rejected: accepted ? [] : ["team@bybee.example"] };
    } };
  }) as unknown as typeof nodemailer.createTransport);
  mock.method(console, "error", () => {});
});

afterEach(() => {
  mock.restoreAll();
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function payload(overrides: Record<string, unknown> = {}) {
  return { name: "Alex Driver", email: `driver${++sequence}@example.com`, phone: "(812) 555-0123", vehicle: "2022 Ford F-150", services: ["Exterior detailing"], notes: "Please check the paint.\nI’m in Southern Indiana.", ...overrides };
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://bybee.example/api/quote/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://bybee.example", ...headers },
    body: JSON.stringify(body),
  });
}

test("submissions send only to the business inbox with the customer as Reply-To", async () => {
  const body = payload({ name: " Alex Driver ", notes: "<script>no HTML</script>", to: "attacker@example.com", from: "attacker@example.com" });
  const response = await POST(request(body));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].from, { name: "Bybee Blackline", address: "quotes@bybee.example" });
  assert.equal(sent[0].to, "team@bybee.example");
  assert.deepEqual(sent[0].replyTo, { name: "Alex Driver", address: body.email });
  assert.match(String(sent[0].text), /2022 Ford F-150/);
  assert.match(String(sent[0].text), /Exterior detailing/);
  assert.match(String(sent[0].text), /<script>no HTML<\/script>/);
  assert.equal(sent[0].html, undefined);
  assert.equal(sent[0].disableFileAccess, true);
  assert.equal(sent[0].disableUrlAccess, true);
  assert.equal(transports[0].secure, true);
  assert.deepEqual(transports[0].auth, { user: "resend", pass: "test-api-key" });
});

test("contact phone, notes, and service selection can be omitted", async () => {
  const body = payload({ services: [] });
  delete (body as Partial<typeof body>).phone;
  delete (body as Partial<typeof body>).notes;
  assert.equal((await POST(request(body))).status, 200);
  assert.match(String(sent[0].text), /Phone: Not provided/);
  assert.match(String(sent[0].text), /Help choosing a service/);
});

test("invalid and injected fields are rejected without sending mail", async () => {
  for (const fields of [
    { name: "   " }, { name: "Alex\r\nBcc: attacker@example.com" }, { name: "a".repeat(101) },
    { email: "not-an-email" }, { email: "a@example.com\r\nBcc:attacker@example.com" },
    { vehicle: " " }, { vehicle: "a".repeat(121) }, { vehicle: "Car\nNew header" },
    { phone: "hi there" }, { phone: 123 }, { notes: "a".repeat(801) }, { notes: {} },
    { services: ["Unknown service"] }, { services: [null] }, { services: "Exterior detailing" },
  ]) {
    const response = await POST(request(payload(fields)));
    assert.equal(response.status, 400, JSON.stringify(fields));
    assert.equal(typeof (await response.json()).error, "string");
  }
  assert.equal(sent.length, 0);
});

test("malformed JSON, non-JSON requests, and large bodies are rejected", async () => {
  const malformed = new Request("https://bybee.example/api/quote/", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal((await POST(malformed)).status, 400);
  assert.equal((await POST(request(payload(), { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await POST(request(null))).status, 400);
  assert.equal((await POST(request([]))).status, 400);
  assert.equal((await POST(request(payload(), { "Content-Length": "12001" }))).status, 413);
  // No Content-Length header: the streamed body limit still applies.
  assert.equal((await POST(request(payload({ notes: "x".repeat(12_001) })))).status, 413);
  assert.equal(sent.length, 0);
});

test("cross-site browser requests cannot trigger email delivery", async () => {
  assert.equal((await POST(request(payload(), { Origin: "https://attacker.example" }))).status, 403);
  assert.equal((await POST(request(payload(), { Origin: "null" }))).status, 403);
  assert.equal((await POST(request(payload(), { "Sec-Fetch-Site": "cross-site" }))).status, 403);
  assert.equal(sent.length, 0);
});

test("the public Host and proxy headers take precedence over Next.js's internal URL", async () => {
  const local = request(payload(), { Host: "127.0.0.1:3100", Origin: "http://127.0.0.1:3100", "X-Forwarded-Proto": "http" });
  assert.equal((await POST(local)).status, 200);
  const proxied = request(payload(), { Host: "internal-server:3000", "X-Forwarded-Host": "www.bybee.example", "X-Forwarded-Proto": "https", Origin: "https://www.bybee.example" });
  assert.equal((await POST(proxied)).status, 200);
  assert.equal((await POST(request(payload(), { "X-Forwarded-Host": "www.bybee.example", Origin: "https://attacker.example" }))).status, 403);
});

test("the spam honeypot never sends an email", async () => {
  const response = await POST(request(payload({ website: "https://spam.example" })));
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(sent.length, 0);
});

test("missing configuration gives a retryable error without exposing secrets", async () => {
  delete process.env.QUOTE_TO_EMAIL;
  const response = await POST(request(payload()));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /try again or call/);
  assert.equal(transports.length, 0);
});

test("SMTP failures and rejected recipients never report success", async () => {
  sendError = Object.assign(new Error("secret SMTP response test-api-key"), { code: "EAUTH" });
  let response = await POST(request(payload()));
  assert.equal(response.status, 503);
  assert.doesNotMatch(JSON.stringify(await response.json()), /test-api-key|SMTP/);
  sendError = undefined;
  accepted = false;
  response = await POST(request(payload()));
  assert.equal(response.status, 503);
});

test("repeated submissions from the same email are throttled case-insensitively", async () => {
  const body = payload();
  for (let i = 0; i < 3; i++) assert.equal((await POST(request(body))).status, 200);
  const response = await POST(request({ ...body, email: body.email.toUpperCase() }));
  assert.equal(response.status, 429);
  assert.equal(sent.length, 3);
});

test("alternative Resend ports use the correct TLS mode", async () => {
  for (const port of ["587", "2465"]) {
    process.env.SMTP_PORT = port;
    assert.equal((await POST(request(payload()))).status, 200);
    const options = transports.at(-1)!;
    assert.equal(options.secure, port === "2465");
    assert.equal(options.requireTLS, port !== "2465");
  }
});
