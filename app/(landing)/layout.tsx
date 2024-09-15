import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import { ReCaptchaProvider } from "next-recaptcha-v3"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Federico & Partners",
  description: "Studio Legale Federico",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReCaptchaProvider useEnterprise>
      <html lang="en">
        <body className={`${inter.className} bg-royal text-ivory flex flex-col items-center w-full`}>
          <Nav />
          {children}
          <Footer />
        </body>
      </html>
    </ReCaptchaProvider>
  );
}
