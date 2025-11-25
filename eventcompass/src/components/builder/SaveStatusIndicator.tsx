import React from 'react';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString();
};

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  lastSaved,
  error,
}) => {
  if (!error && !isSaving && !lastSaved) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        backgroundColor: error ? '#fee' : isSaving ? '#fff3cd' : '#d4edda',
        border: `1px solid ${error ? '#dc3545' : isSaving ? '#ffc107' : '#28a745'}`,
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 500,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {error && <span style={{ color: '#dc3545' }}>⚠️ {error}</span>}
      {!error && isSaving && <span style={{ color: '#856404' }}>💾 Saving...</span>}
      {!error && !isSaving && lastSaved && (
        <span style={{ color: '#155724' }}>✓ Saved {formatTimeAgo(lastSaved)}</span>
      )}
    </div>
  );
};