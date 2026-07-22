import { FormData, StoredDraft, StoredResume, ResumeMeta, ExportedResume } from '../types';

const STORAGE_PREFIX = 'resucraft_';
const OLD_PREFIX = 'resumeforge_';

// ─── One-time migration from old prefix ───
function migrateFromOldPrefix(): void {
    try {
        const oldKeys = Object.keys(localStorage).filter(k => k.startsWith(OLD_PREFIX));
        if (oldKeys.length === 0) return; // Nothing to migrate

        let migrated = 0;
        for (const key of oldKeys) {
            const newKey = key.replace(OLD_PREFIX, STORAGE_PREFIX);
            if (!localStorage.getItem(newKey)) {
                const value = localStorage.getItem(key);
                if (value) {
                    localStorage.setItem(newKey, value);
                    migrated++;
                }
            }
        }

        // Also migrate writing style key separately (not prefix-based)
        const oldStyle = localStorage.getItem('resumeforge_writing_style');
        if (oldStyle && !localStorage.getItem('resucraft_writing_style')) {
            localStorage.setItem('resucraft_writing_style', oldStyle);
            migrated++;
        }

        if (migrated > 0) {
            console.log(`Migrated ${migrated} items from '${OLD_PREFIX}' to '${STORAGE_PREFIX}'`);
        }
    } catch (err) {
        console.warn('Failed to migrate old storage prefix:', err);
    }
}

// Run migration immediately
migrateFromOldPrefix();

const DRAFT_KEY = (templateId: string): string => `${STORAGE_PREFIX}draft_${templateId}`;
const LAST_TEMPLATE_KEY = `${STORAGE_PREFIX}last_template`;
const RESUME_INDEX_KEY = `${STORAGE_PREFIX}resume_index`;
const RESUME_KEY = (id: string): string => `${STORAGE_PREFIX}resume_${id}`;
const ACTIVE_RESUME_KEY = `${STORAGE_PREFIX}active_resume`;

// ─── Legacy single-draft functions (keep for backward compat) ───

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

// ─── Multi-resume functions ───

const DEFAULT_FORM_DATA: FormData = {
    firstName: '',
    lastName: '',
    designation: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    image: null,
    skillsRaw: '',
    experiences: [],
    educations: [],
    projects: [],
    achievements: []
};

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getResumeIndex(): ResumeMeta[] {
    try {
        const raw = localStorage.getItem(RESUME_INDEX_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveResumeIndex(index: ResumeMeta[]): void {
    try {
        localStorage.setItem(RESUME_INDEX_KEY, JSON.stringify(index));
    } catch (err) {
        console.error('Failed to save resume index:', err);
    }
}

function updateResumeInIndex(id: string, updates: Partial<ResumeMeta>): void {
    const index = getResumeIndex();
    const idx = index.findIndex(r => r.id === id);
    if (idx !== -1) {
        index[idx] = { ...index[idx], ...updates, updatedAt: new Date().toISOString() };
        saveResumeIndex(index);
    }
}

export function getResumeById(id: string): StoredResume | null {
    try {
        const raw = localStorage.getItem(RESUME_KEY(id));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveResume(meta: ResumeMeta, formData: FormData): boolean {
    try {
        const key = RESUME_KEY(meta.id);
        const stored: StoredResume = { meta, formData };
        localStorage.setItem(key, JSON.stringify(stored));
        // Update index
        const index = getResumeIndex();
        const existingIdx = index.findIndex(r => r.id === meta.id);
        const updatedMeta = { ...meta, updatedAt: new Date().toISOString() };
        if (existingIdx !== -1) {
            index[existingIdx] = updatedMeta;
        } else {
            index.push(updatedMeta);
        }
        saveResumeIndex(index);
        return true;
    } catch (err) {
        console.error('Failed to save resume:', err);
        return false;
    }
}

export function createResume(name: string, templateId: string): StoredResume {
    const now = new Date().toISOString();
    const meta: ResumeMeta = {
        id: generateId(),
        name,
        templateId,
        createdAt: now,
        updatedAt: now
    };
    const resume: StoredResume = {
        meta,
        formData: { ...DEFAULT_FORM_DATA }
    };
    // Save to storage
    localStorage.setItem(RESUME_KEY(meta.id), JSON.stringify(resume));
    const index = getResumeIndex();
    index.push(meta);
    saveResumeIndex(index);
    return resume;
}

export function deleteResume(id: string): void {
    try {
        localStorage.removeItem(RESUME_KEY(id));
        const index = getResumeIndex().filter(r => r.id !== id);
        saveResumeIndex(index);
        // Clear active if deleted
        if (getActiveResumeId() === id) {
            localStorage.removeItem(ACTIVE_RESUME_KEY);
        }
    } catch (err) {
        console.error('Failed to delete resume:', err);
    }
}

export function duplicateResume(id: string): StoredResume | null {
    const original = getResumeById(id);
    if (!original) return null;
    const now = new Date().toISOString();
    const meta: ResumeMeta = {
        id: generateId(),
        name: `${original.meta.name} (Copy)`,
        templateId: original.meta.templateId,
        createdAt: now,
        updatedAt: now
    };
    const resume: StoredResume = {
        meta,
        formData: JSON.parse(JSON.stringify(original.formData)) // Deep clone
    };
    localStorage.setItem(RESUME_KEY(meta.id), JSON.stringify(resume));
    const index = getResumeIndex();
    index.push(meta);
    saveResumeIndex(index);
    return resume;
}

export function renameResume(id: string, name: string): boolean {
    try {
        // Update in storage
        const key = RESUME_KEY(id);
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const resume: StoredResume = JSON.parse(raw);
        resume.meta.name = name;
        resume.meta.updatedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(resume));
        // Update index
        updateResumeInIndex(id, { name });
        return true;
    } catch {
        return false;
    }
}

export function getActiveResumeId(): string | null {
    try {
        return localStorage.getItem(ACTIVE_RESUME_KEY);
    } catch {
        return null;
    }
}

export function setActiveResumeId(id: string | null): void {
    try {
        if (id) {
            localStorage.setItem(ACTIVE_RESUME_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_RESUME_KEY);
        }
    } catch {
        // Silently fail
    }
}


