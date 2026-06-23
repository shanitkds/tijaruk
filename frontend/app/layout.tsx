// @ts-nocheck
import "./globals.css";
import Preloader from "../components/preloader/Preloader";
import SmoothScrolling from "../components/shares/SmoothScrolling";
import GoogleAuthProvider from "../components/auth/GoogleAuthProvider";

export const metadata = {
  title: "Tijaruk - Your Complete Trade & Growth Partner",
  description:
    "Tijaruk connects Saudi Arabia-based wholesalers, suppliers, and retailers to global markets through trusted partnerships.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
      </head>
      <body>
        <GoogleAuthProvider>
          <SmoothScrolling>
            <Preloader />
            {children}
          </SmoothScrolling>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}

