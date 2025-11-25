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


// Intake Form Component
const IntakeForm = ({ selectedPath, onBack, onSubmit, formData, setFormData }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
        
        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', marginBottom: '32px' }}>
            Tell us about your event
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                Organization Name/Type
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  color: '#4a5676',
                  fontWeight: 500,
                }}
                placeholder={selectedPath === 'no-idea' ? "e.g., Alzheimer's Awareness Group" : "e.g., Korean Cultural Association"}
                onChange={(e) => setFormData({...formData, org: e.target.value})}
              />
            </div>

            {selectedPath === 'no-idea' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '12px' }}>
                    Event Goals
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>Fundraising</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>Awareness/Education</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>Community Bonding</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '12px' }}>
                    Event Vibe
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>Cozy / Reflective</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>High-energy / Social</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.95rem', color: '#4a5676' }}>Hands-on / Interactive</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {selectedPath === 'rough-idea' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  What's your rough idea?
                </label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    color: '#4a5676',
                    fontWeight: 500,
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  placeholder="e.g., Food event around Korean snacks, something interactive"
                  onChange={(e) => setFormData({...formData, idea: e.target.value})}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  Budget Range
                </label>
                <select style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  color: '#4a5676',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  <option>$0 - $500</option>
                  <option>$500 - $1000</option>
                  <option>$1000 - $2000</option>
                  <option>$2000+</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5676', marginBottom: '8px' }}>
                  Expected Attendance
                </label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    color: '#4a5676',
                    fontWeight: 500,
                  }}
                  placeholder="e.g., 60"
                />
              </div>
            </div>

            <button
              onClick={onSubmit}
              style={{
                marginTop: '16px',
                padding: '14px 32px',
                backgroundColor: '#6B7FD7',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AutoAwesomeIcon style={{ width: '18px', height: '18px' }} />
              Generate Event Ideas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;