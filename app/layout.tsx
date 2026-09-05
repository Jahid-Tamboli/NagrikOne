import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NagrikOne — One Platform. Every Problem.',
  description: 'AI-powered citizen dispute and complaint resolution platform. Government, civic, cybercrime, banking, and consumer grievance escalation.',
  keywords: ['NagrikOne', 'citizen grievance', 'cybercrime 1930', 'municipal complaint', 'pothole report', 'consumer dispute'],
  authors: [{ name: 'Jahid Tamboli' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#040914'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
