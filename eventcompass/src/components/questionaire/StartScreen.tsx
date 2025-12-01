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
import { Start } from '@mui/icons-material';

// Start Screen Component
const StartScreen = ({ onSelectPath }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#333', marginBottom: '12px' }}>
            Event Builder
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
            Plan your campus event with AI assistance
          </p>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', marginBottom: '32px' }}>
            How much do you already know about your event?
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => onSelectPath('no-idea')}
              style={{
                padding: '24px',
                backgroundColor: '#FFF',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6B7FD7'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <LightbulbIcon style={{ width: '32px', height: '32px', color: '#6B7FD7' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333', margin: '0 0 8px 0' }}>
                    I have no idea yet
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#666', margin: 0 }}>
                    Just a cause or theme - help me brainstorm event concepts
                  </p>
                </div>
                <ChevronRightIcon style={{ width: '24px', height: '24px', color: '#999' }} />
              </div>
            </button>

            <button
              onClick={() => onSelectPath('rough-idea')}
              style={{
                padding: '24px',
                backgroundColor: '#FFF',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6B7FD7'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <EditIcon style={{ width: '32px', height: '32px', color: '#6B7FD7' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333', margin: '0 0 8px 0' }}>
                    I have a rough idea
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#666', margin: 0 }}>
                    I know the general direction but need help fleshing it out
                  </p>
                </div>
                <ChevronRightIcon style={{ width: '24px', height: '24px', color: '#999' }} />
              </div>
            </button>

            <button
              onClick={() => onSelectPath('solid-idea')}
              style={{
                padding: '24px',
                backgroundColor: '#FFF',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6B7FD7'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckBoxIcon style={{ width: '32px', height: '32px', color: '#6B7FD7' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333', margin: '0 0 8px 0' }}>
                    I have a solid idea
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#666', margin: 0 }}>
                    I need detailed planning support and logistics help
                  </p>
                </div>
                <ChevronRightIcon style={{ width: '24px', height: '24px', color: '#999' }} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;