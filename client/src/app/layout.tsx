import './globals.css';
import React from 'react';

export const metadata = {
    title: 'ResuCraft',
    description: 'AI-Powered Career Strategist',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body>{children}</body>
        </html>
    );
}
