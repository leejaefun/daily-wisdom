import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const myeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Wisdom",
  description: "A daily dose of silence and wisdom.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Daily Wisdom",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#fdfbf7",
};

import NavBar from "./components/NavBar";
import { LanguageProvider } from "./context/LanguageContext";
import { SoundProvider } from "./context/SoundContext";

// ... (existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${myeongjo.className} antialiased bg-stone-100 text-stone-800`}
      >
        <LanguageProvider>
          <SoundProvider>
            {children}
            <NavBar />
          </SoundProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
