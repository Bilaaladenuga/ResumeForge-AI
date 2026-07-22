import { useState, useRef, useCallback } from 'react';
import { FormData } from '../types';

const MAX_HISTORY = 50;

interface UndoRedoState {
    state: FormData;
    setState: (value: FormData | ((prev: FormData) => FormData)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    pushSnapshot: (snapshot: FormData) => void;
}

export function useUndoRedo(initialState: FormData): UndoRedoState {
    const [state, setStateInternal] = useState<FormData>(initialState);
    const pastRef = useRef<FormData[]>([]);
    const futureRef = useRef<FormData[]>([]);
    const isUndoRedoRef = useRef(false);

    const setState = useCallback((value: FormData | ((prev: FormData) => FormData)) => {
        if (isUndoRedoRef.current) {
            // During undo/redo, just set state without recording history
            setStateInternal(value as FormData);
            return;
        }

        setStateInternal(prev => {
            const next = typeof value === 'function' ? (value as (prev: FormData) => FormData)(prev) : value;

            // Only record if the data actually changed
            if (JSON.stringify(prev) !== JSON.stringify(next)) {
                pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev];
                futureRef.current = [];
            }

            return next;
        });
    }, []);

    const undo = useCallback(() => {
        if (pastRef.current.length === 0) return;

        isUndoRedoRef.current = true;
        const previous = pastRef.current[pastRef.current.length - 1];
        pastRef.current = pastRef.current.slice(0, -1);

        setStateInternal(prev => {
            futureRef.current = [prev, ...futureRef.current];
            return previous;
        });
        isUndoRedoRef.current = false;
    }, []);

    const redo = useCallback(() => {
        if (futureRef.current.length === 0) return;

        isUndoRedoRef.current = true;
        const next = futureRef.current[0];
        futureRef.current = futureRef.current.slice(1);

        setStateInternal(prev => {
            pastRef.current = [...pastRef.current, prev];
            return next;
        });
        isUndoRedoRef.current = false;
    }, []);

    // Expose a way to explicitly push a snapshot (for programmatic bulk changes)
    const pushSnapshot = useCallback((snapshot: FormData) => {
        pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snapshot];
        futureRef.current = [];
    }, []);

    return {
        state,
        setState,
        undo,
        redo,
        canUndo: pastRef.current.length > 0,
        canRedo: futureRef.current.length > 0,
        pushSnapshot,
    };
}
