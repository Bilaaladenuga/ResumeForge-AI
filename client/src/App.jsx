import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TemplateSelector from './components/TemplateSelector';
import ResumeBuilder from './components/ResumeBuilder';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/templates" element={<TemplateSelector />} />
            <Route path="/builder/:templateId" element={<ResumeBuilder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
