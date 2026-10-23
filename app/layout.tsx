import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://bybee-black-line-detailing.fizzy-park-3620.chatgpt.site"),
  title: "Bybee Black Line | Auto Detailing",
  description: "Interior and exterior auto detailing, paint correction, and protection in Louisville, KY and Southern Indiana. Contact Bybee Black Line for a quote.",
  openGraph: { title: "Bybee Black Line Auto Detailing", description: "Auto detailing in Louisville, KY and Southern Indiana. Request a quote for your vehicle.", images: ["/images/bybee-logo.png"] },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
