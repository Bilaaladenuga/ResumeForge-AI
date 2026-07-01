import './globals.css';

export const metadata = {
  title: 'ResumeForge AI',
  description: 'AI-Powered Career Strategist',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
