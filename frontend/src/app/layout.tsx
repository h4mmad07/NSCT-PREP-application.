import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NSCT PREP — National Skill Competency Test Preparation Platform',
  description: 'Flexible subject-based, topic-based, timed, adaptive, and full mock-test preparation for CS students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
