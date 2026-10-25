# Bybee Blackline Auto Detailing

A Next.js App Router site with a black and silver visual identity, shadcn/ui components built on Radix primitives, and an interactive Three.js finish studio.

## Develop

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Run `npm run typecheck` to check types, `npm test` to verify quote submissions with a mocked SMTP transport, and `npm run build` to create a production build. Run `npm start` to serve the production app. Set `PORT` to use a different port.

## Quote emails with Resend SMTP

Copy `.env.example` to `.env.local` and fill in the values. In production, set the same server-only variables in your hosting provider’s environment settings, then restart or redeploy the app.

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | `smtp.resend.com` (default) |
| `SMTP_PORT` | `465` (default; implicit TLS) |
| `SMTP_USER` | `resend` (default) |
| `SMTP_PASSWORD` | Your Resend API key |
| `QUOTE_FROM_EMAIL` | A sender email address on your verified Resend domain, e.g. `quotes@yourdomain.com` |
| `QUOTE_TO_EMAIL` | The inbox that receives quote requests |

Use plain email addresses for the sender and recipient. The sender display name is “Bybee Blackline.” Replies go to the customer’s submitted email address. Ports `465` and `2465` use implicit TLS; other SMTP ports require STARTTLS. See [Resend’s SMTP setup](https://resend.com/docs/send-with-smtp) for API key and domain verification details.

The form posts to `/api/quote/` and sends one notification to the configured business inbox. The customer sees a success message only after the SMTP server accepts the email. Failed requests retain the entered details for retrying. No confirmation email or appointment is created automatically.

The endpoint validates fields, limits request size, rejects cross-site browser submissions, and includes a hidden spam field and a per-email throttle of three attempts per 15 minutes per server process. For a deployment with multiple instances, configure shared rate limits at the hosting layer. Quote contents are not stored in a database or application logs; they are sent through Resend to your inbox.

**Hosting:** email submissions require a Next.js Node.js server (or a compatible serverless Node.js deployment) with outbound SMTP access. This app no longer uses a static export; uploading the old `out/` directory will not run the form endpoint. SMTP credentials must stay server-only, without a `NEXT_PUBLIC_` prefix. Environment files are ignored by Git except for the blank `.env.example`.

## Features

- Original supplied logo and locally hosted fonts and imagery.
- Interactive 3D car with black/silver paint, rotation, pause, and view reset.
- Responsive layouts, mobile navigation, service dialogs, and FAQ accordion.
- Quote form with contact details, vehicle, service selection, optional notes, and server-side Resend SMTP email delivery. Both business phone numbers remain available as call alternatives.
- Both supplied phone numbers and the Louisville, KY / Southern Indiana service area.
- Reduced-motion preferences, keyboard navigation, lazy-loaded 3D code, and a photo fallback if WebGL is unavailable.

Service descriptions are initial editorial content; confirm actual services and scope with the business before a public launch. Photography and the 3D car are illustrative rather than a customer work gallery.

## Asset credits

“Ferrari 458 Italia” model by vicent091036: https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6, CC BY 4.0, sourced from Three.js examples. Materials, lighting, and presentation modified. Model and AO texture source: https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf. Vehicle brands are not affiliated with Bybee Blackline.

Automotive photographs from Unsplash (photo IDs 1503376780353-7e6692767b70, 1605437241278-c1806d14a4d9, and 1492144534655-ae79c964c9d7). Fonts: Barlow Condensed and Manrope, Google Fonts, licensed under the SIL Open Font License. Three.js Draco decoder files retain their distributed license notices.

