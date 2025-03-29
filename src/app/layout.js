
import localFont from "next/font/local";
import "./globals.css";

import { MenuBar } from '@/app/components/Menubar'; 
import { WalletProvider } from '@/app/components/WalletContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Set up metadata for the page
export const metadata = {
  title: 'Watch Authentication',
  description: 'Watch Authentication DApp',
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the content with WalletProvider */}
          <WalletProvider>
          <MenuBar /> {/* Render the MenuBar */}
          <main className="container mx-auto">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
