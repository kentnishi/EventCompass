import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ConceptsScreen = ({ selectedPath, concepts, selectedConcept, onSelectConcept, onCreatePlan, onBack, handleSubmit }) => {
  const [view, setView] = useState('selection'); // 'selection', 'customization', 'generating'

  const handleGenerateClick = () => {
    setView('generating');
  };

  // Selection View
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
              Here are your event concepts
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
              Select one to customize and generate a complete event plan
            </p>
          </div>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
            {concepts.map(concept => {
              const isSelected = selectedConcept?.id === concept.id;
              
              return (
                <div
                  key={concept.id}
                  onClick={() => onSelectConcept(concept)}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: isSelected ? '3px solid #6B7FD7' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: '#6B7FD7',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
                      Selected
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#333', margin: 0 }}>
                        {concept.title}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <span style={{
                        padding: '6px 14px',
                        backgroundColor: '#f8f9ff',
                        color: '#6B7FD7',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}>
                        {concept.goal}
                      </span>
                      {concept.budget && (
                        <span style={{
                          padding: '6px 14px',
                          backgroundColor: '#f0f0f0',
                          color: '#666',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}>
                          {concept.budget}
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>
                    {concept.description}
                  </p>

                  {/* Event Details Grid */}
                  {(concept.estimatedBudget || concept.duration || concept.attendance || concept.venue) && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '16px',
                      marginBottom: '24px',
                      padding: '20px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '12px'
                    }}>
                      {concept.estimatedBudget && (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                            BUDGET
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                            {concept.estimatedBudget}
                          </div>
                        </div>
                      )}
                      {concept.duration && (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                            DURATION
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                            {concept.duration}
                          </div>
                        </div>
                      )}
                      {concept.attendance && (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                            ATTENDANCE
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                            {concept.attendance}
                          </div>
                        </div>
                      )}
                      {concept.venue && (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                            VENUE
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                            {concept.venue}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Section */}
                  {concept.preview && (
                    <div style={{ 
                      padding: '20px', 
                      backgroundColor: '#fafafa', 
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
                        WHAT WE'LL GENERATE FOR YOU:
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7FD7', marginBottom: '8px' }}>
                            📋 Activities
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#666' }}>
                            {concept.preview.activities.map((act, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>{act}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7FD7', marginBottom: '8px' }}>
                            🗓️ Schedule
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>
                            {concept.preview.schedule}
                          </div>
                          
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7FD7', marginBottom: '8px' }}>
                            📦 Key Shopping Items
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#666' }}>
                            {concept.preview.keyItems.slice(0, 3).map((item, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Elements Section */}
                  {concept.elements && concept.elements.length > 0 && !concept.preview && (
                    <div style={{ 
                      padding: '20px', 
                      backgroundColor: '#fafafa', 
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#333', marginBottom: '12px' }}>
                        KEY ELEMENTS:
                      </h4>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {concept.elements.map((el, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: '#fff',
                              color: '#666',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                            }}
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedConcept && (
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '16px 32px',
                backgroundColor: '#6B7FD7',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(107, 127, 215, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Customize & Generate Plan →
            </button>
          )}
        </div>
      </div>
    );
  


  };

export default ConceptsScreen;