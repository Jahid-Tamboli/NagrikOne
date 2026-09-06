import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NagrikOne — One Problem. One Platform. One Smarter Solution.',
  description: 'AI-powered citizen dispute and complaint resolution platform for India. Statutory routing for civic, banking, cybercrime, women safety, and consumer grievances.',
  keywords: [
    'NagrikOne',
    'NOVA AI',
    'citizen grievance India',
    'cybercrime 1930',
    'municipal pothole complaint',
    'banking ombudsman dispute',
    'consumer court e-daakhil',
    'tenancy dispute notice',
    'Jahid Tamboli'
  ],
  authors: [{ name: 'Jahid Tamboli', url: 'mailto:tambolijahid04@gmail.com' }],
  creator: 'Jahid Tamboli',
  publisher: 'NagrikOne',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nagrik-one-kappa.vercel.app',
    title: 'NagrikOne — One Problem. One Platform. One Smarter Solution.',
    description: 'Tell NagrikOne what you are facing. NOVA AI helps you understand what to do next and maps official statutory escalation routes.',
    siteName: 'NagrikOne'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NagrikOne — One Problem. One Platform. One Smarter Solution.',
    description: 'Intelligent AI citizen dispute and complaint resolution platform.',
    creator: '@JahidTamboli'
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#040914'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-slate-950 min-h-screen bg-[#040914]">
        {children}
      </body>
    </html>
  );
}

