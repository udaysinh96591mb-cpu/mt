import type {Metadata} from 'next';
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-rajdhani' });
const jetbrainsMono = JetBrains_Mono({ weight: ['500', '700'], subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Uday Car Shopkeeper — Genuine Parts. Trusted Service.',
  description: 'Uday Car Shopkeeper — genuine car accessories and parts, fast WhatsApp ordering, trusted by customers.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0b0f14] text-[#f4f7fa] font-sans antialiased overflow-x-hidden selection:bg-[#ff6a1a] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
