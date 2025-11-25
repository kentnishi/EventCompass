import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  triggerSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  clearError: () => void;
}

export const useAutoSave = ({ 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const triggerSave = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        await onSave();
        
        if (isMountedRef.current) {
          setLastSaved(new Date());
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to save';
          setError(errorMessage);
          console.error('Auto-save error:', err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, delay);
  }, [onSave, delay, enabled]);

  return {
    triggerSave,
    isSaving,
    lastSaved,
    error,
    clearError,
  };
};