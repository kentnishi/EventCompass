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


// Concepts Screen Component
const ConceptsScreen = ({ selectedPath, concepts, selectedConcept, onSelectConcept, onCreatePlan, onBack }) => {
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
            Here are some event ideas for you
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
            Select one to create a detailed event plan
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
          {concepts.map(concept => {
            const isSelected = selectedConcept?.id === concept.id;
            
            return (
              <button
                key={concept.id}
                onClick={() => onSelectConcept(concept)}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: isSelected ? '2px solid #6B7FD7' : '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: '0 0 8px 0' }}>
                      {concept.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: '#f8f9ff',
                      color: '#6B7FD7',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}>
                      {concept.goal}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon style={{ width: '32px', height: '32px', color: '#6B7FD7' }} />
                  )}
                </div>

                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
                  {concept.description}
                </p>

                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', marginBottom: '8px' }}>
                    Key Elements:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {concept.elements.map((el, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedConcept && (
          <button
            onClick={onCreatePlan}
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
            <AutoAwesomeIcon style={{ width: '20px', height: '20px' }} />
            Create Detailed Event Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default ConceptsScreen;