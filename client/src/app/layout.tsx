import './globals.css';
import React from 'react';

export const metadata = {
    title: 'ResumeForge AI',
    description: 'AI-Powered Career Strategist',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
