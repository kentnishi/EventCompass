
import React, { useState } from 'react';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Preview Screen Component
const PreviewScreen = ({ eventPlan, keepSections, onToggleSection, onProceed, onBack }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6B7FD7',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowBackIcon style={{ width: '16px', height: '16px' }} />
          Back
        </button>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#333', marginBottom: '12px' }}>
            Review Your Event Plan
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
            We've created a plan based on your event. Select the sections you want to include.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #4caf50',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <CheckCircleIcon style={{ width: '32px', height: '32px', color: '#4caf50' }} />
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: '0 0 4px 0' }}>
                  Overview
                </h3>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  ALWAYS INCLUDED
                </span>
              </div>
            </div>
            <div style={{ marginLeft: '48px', fontSize: '0.9rem', color: '#666' }}>
              <div><strong>Event:</strong> {eventPlan.name}</div>
              <div><strong>Organization:</strong> {eventPlan.org}</div>
              <div><strong>Expected Attendance:</strong> {eventPlan.attendance} students</div>
            </div>
          </div>

          {[
            { key: 'activities', title: 'Activities', desc: 'Core activities and descriptions' },
            { key: 'schedule', title: 'Schedule', desc: 'Timeline and duration' },
            { key: 'shopping', title: 'Shopping List', desc: 'Items to purchase' },
            { key: 'tasks', title: 'Tasks', desc: 'To-do items with deadlines' },
            { key: 'budget', title: 'Budget', desc: 'Estimated costs' },
          ].map(section => {
            const isSelected = keepSections[section.key];
            
            return (
              <button
                key={section.key}
                onClick={() => onToggleSection(section.key)}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: isSelected ? '2px solid #6B7FD7' : '2px solid #e0e0e0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isSelected ? (
                    <CheckCircleIcon style={{ width: '32px', height: '32px', color: '#6B7FD7' }} />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '2px solid #ccc',
                      borderRadius: '50%',
                    }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: '0 0 4px 0' }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                      {section.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onProceed}
          style={{
            width: '100%',
            padding: '14px 32px',
            backgroundColor: '#6B7FD7',
            color: '#FFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(107, 127, 215, 0.3)',
          }}
        >
          Continue to Event Editor
          <ArrowForwardIcon style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    </div>
  );
};

export default PreviewScreen;