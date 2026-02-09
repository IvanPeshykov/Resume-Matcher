import type { Metadata } from 'next';
import './(default)/css/globals.css';

export const metadata: Metadata = {
  title: 'LandedJob',
  description: 'AI powered resume tailoring.',
  applicationName: 'Resume Matcher',
  keywords: ['resume', 'matcher', 'job', 'application'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="h-full" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#F0F0E8] text-gray-900 min-h-full">
        {children}
      </body>
    </html>
  );
}
