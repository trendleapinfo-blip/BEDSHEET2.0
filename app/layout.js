import { Cormorant_Garamond, Plus_Jakarta_Sans, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import AnalyticsTracker from "./components/AnalyticsTracker";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL('https://www.closetrush.in'),
  title: {
    default: "ClosetRush | Premium Bedding & Linen Rental Service",
    template: "%s | ClosetRush"
  },
  description: "Rent clean bed sheets at just ₹100 per month. Clean, fresh organic bedsheets and pillow covers delivered to your doorstep. Free delivery, pause or cancel anytime.",
  keywords: ["clean bedding", "bedsheet rental", "hygienic bedsheets", "prevent bedsheet acne", "dust mite allergy bedding", "sleep hygiene", "hostel bedding", "closetrush", "rent bedsheets", "rent bedsheets bangalore", "bedding rental"],
  openGraph: {
    title: "ClosetRush | Premium Bedding & Linen Rental Service",
    description: "Rent clean bed sheets at just ₹100 per month. Free delivery, pause or cancel anytime.",
    url: "https://www.closetrush.in",
    siteName: "ClosetRush",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "ClosetRush Premium Bedding"
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClosetRush | Premium Bedding & Linen Rental Service",
    description: "Rent clean bed sheets at just ₹100 per month. Free delivery, pause or cancel anytime.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ClosetRush",
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "0EETb5ay93vXXuJYFgzVq0UXtcKtuZhjMWSQsY0biiw",
  },
};

export const viewport = {
  themeColor: "#032026",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} ${geistMono.variable} ${outfit.variable} min-h-screen antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Script
          id="pwa-sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('PWA ServiceWorker registration successful');
                      // Force check for updates every time the app loads
                      registration.update();
                    },
                    function(err) {
                      console.log('PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });

                // Auto-refresh the PWA when a new update (new commit) is detected and activated
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
        <ScrollToTop />
        {children}
        <Chatbot />
        <Analytics />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
