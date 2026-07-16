import { FormData, StoredDraft, ExportedResume } from '../types';

const STORAGE_PREFIX = 'resumeforge_';
const DRAFT_KEY = (templateId: string): string => `${STORAGE_PREFIX}draft_${templateId}`;
const LAST_TEMPLATE_KEY = `${STORAGE_PREFIX}last_template`;

export const saveDraft = (templateId: string, formData: FormData): boolean => {
    try {
        const key = DRAFT_KEY(templateId);
        const data: StoredDraft = {
            formData,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(LAST_TEMPLATE_KEY, templateId);
        return true;
    } catch (err) {
        console.error('Failed to save draft:', err);
        if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
            clearOldDrafts();
            try {
                const data: StoredDraft = { formData, savedAt: new Date().toISOString() };
                localStorage.setItem(DRAFT_KEY(templateId), JSON.stringify(data));
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }
};

export const loadDraft = (templateId: string): FormData | null => {
    try {
        const key = DRAFT_KEY(templateId);
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed: StoredDraft = JSON.parse(raw);
        return parsed.formData || null;
    } catch (err) {
        console.error('Failed to load draft:', err);
        return null;
    }
};

export const clearDraft = (templateId: string): boolean => {
    try {
        localStorage.removeItem(DRAFT_KEY(templateId));
        return true;
    } catch {
        return false;
    }
};

export const clearAllDrafts = (): boolean => {
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        return true;
    } catch {
        return false;
    }
};

export const clearOldDrafts = (): void => {
    try {
        interface DraftEntry {
            key: string;
            savedAt: Date;
        }
        const drafts: DraftEntry[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX) && key.includes('draft_')) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw) as StoredDraft;
                        drafts.push({ key, savedAt: new Date(parsed.savedAt || 0) });
                    }
                } catch {
                    drafts.push({ key, savedAt: new Date(0) });
                }
            }
        }
        drafts.sort((a, b) => a.savedAt.getTime() - b.savedAt.getTime());
        while (drafts.length > 5) {
            const oldest = drafts.shift();
            if (oldest) localStorage.removeItem(oldest.key);
        }
    } catch {
        // Silently fail cleanup
    }
};

export const getLastTemplateId = (): string | null => {
    try {
        return localStorage.getItem(LAST_TEMPLATE_KEY);
    } catch {
        return null;
    }
};

export const exportResumeAsJSON = (formData: FormData): void => {
    const exportData: ExportedResume = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        resume: formData
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = [formData.firstName, formData.lastName].filter(Boolean).join('_') || 'resume';
    a.href = url;
    a.download = `${name}_resume.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importResumeFromJSON = (file: File): Promise<FormData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data && data.resume) {
                    resolve(data.resume as FormData);
                } else if (data && (data.firstName || data.designation)) {
                    resolve(data as FormData);
                } else {
                    reject(new Error('Invalid resume file format. Expected a resume object with personal information.'));
                }
            } catch (err) {
                reject(new Error('Could not parse file. Please ensure it is a valid JSON resume file.'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

export const subscribeToStorageChanges = (callback: (key: string, value: string | null) => void): (() => void) => {
    const handler = (e: StorageEvent) => {
        if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
            callback(e.key, e.newValue);
        }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
};
