import type { Metadata } from "next";
import { Geist, Geist_Mono, Russo_One, Barlow, Barlow_Condensed, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "./components/TopBar";
import NavBar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  weight: "400",
  variable: "--font-russo-one",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow-custom",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed-custom",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moonight",
  description: "A movie nights planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl" 
      className={`${geistSans.variable} ${geistMono.variable} ${russoOne.variable} ${barlow.variable} ${barlowCondensed.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-1 flex-col">
       <div className="scanlines flex flex-col h-full">
        <TopBar />
        <NavBar />
        {children}
        <MobileNavbar />
        <Footer />
       </div>
      </body>
    </html>
  );
}
