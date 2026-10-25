import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://bybee-black-line-detailing.fizzy-park-3620.chatgpt.site"),
  title: "BYBEE BLACKLINE | AUTO DETAILING",
  description: "INTERIOR AND EXTERIOR AUTO DETAILING, PAINT CORRECTION, AND PROTECTION IN LOUISVILLE, KY AND SOUTHERN INDIANA. CONTACT BYBEE BLACKLINE FOR A QUOTE.",
  openGraph: { title: "BYBEE BLACKLINE AUTO DETAILING", description: "AUTO DETAILING IN LOUISVILLE, KY AND SOUTHERN INDIANA. REQUEST A QUOTE FOR YOUR VEHICLE.", images: ["/images/bybee-logo.png"] },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
