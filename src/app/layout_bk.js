import localFont from "next/font/local";
import "./globals.css";

// Import the MenuBar component
import { MenuBar } from '@/app/components/Menubar'; 

// Import WalletProvider
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
  title: 'Next.js DApp',
  description: 'Connect MetaMask to a Next.js DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the content with WalletProvider */}
        <WalletProvider>
          <MenuBar /> {/* Render the MenuBar */}
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
