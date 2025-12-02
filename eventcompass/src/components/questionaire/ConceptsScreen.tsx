import React, { useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ConceptsScreen = ({ selectedPath, concepts, selectedConcept, onSelectConcept, onCreatePlan, onBack }) => {
  const [view, setView] = useState('selection'); // 'selection', 'customization', 'generating'
  const [customizations, setCustomizations] = useState({
    includeActivities: true,
    includeSchedule: true,
    includeShopping: true,
    includeTasks: true,
    includeBudget: true,
    detailLevel: 'comprehensive'
  });

  const handleCustomizeClick = () => {
    setView('customization');
  };

  const handleGenerateClick = () => {
    setView('generating');
    
    // Simulate generation (replace with actual API call later)
    setTimeout(() => {
      onCreatePlan(customizations);
    }, 3000);
  };

  // Selection View
  if (view === 'selection') {
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
              onClick={handleCustomizeClick}
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
  }

  // Customization View
  if (view === 'customization') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button 
            onClick={() => setView('selection')}
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
            Back to Concepts
          </button>

          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
                Customize Your Event Plan
              </h2>
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
                Selected: <strong>{selectedConcept?.title}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
                What should we include in your plan?
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'includeActivities', label: 'Detailed Activities', desc: 'Breakdown of all event activities with descriptions and staffing needs' },
                  { key: 'includeSchedule', label: 'Complete Schedule', desc: 'Timeline with start/end times for each activity' },
                  { key: 'includeShopping', label: 'Shopping List', desc: 'Materials, supplies, and food items with quantities and vendors' },
                  { key: 'includeTasks', label: 'Task Checklist', desc: 'Action items with assignments, deadlines, and priorities' },
                  { key: 'includeBudget', label: 'Budget Breakdown', desc: 'Category allocations and spending tracking' }
                ].map(item => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: customizations[item.key] ? '#f8f9ff' : '#fafafa',
                      border: customizations[item.key] ? '2px solid #6B7FD7' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={customizations[item.key]}
                      onChange={(e) => setCustomizations({ ...customizations, [item.key]: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
                Level of Detail
              </h3>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { value: 'basic', label: 'Basic', desc: 'High-level overview' },
                  { value: 'detailed', label: 'Detailed', desc: 'Standard planning info' },
                  { value: 'comprehensive', label: 'Comprehensive', desc: 'Everything you need' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => setCustomizations({ ...customizations, detailLevel: level.value })}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: customizations.detailLevel === level.value ? '#6B7FD7' : '#FFF',
                      color: customizations.detailLevel === level.value ? '#FFF' : '#333',
                      border: customizations.detailLevel === level.value ? 'none' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div>{level.label}</div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 400, 
                      marginTop: '4px',
                      opacity: 0.8
                    }}>
                      {level.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fff8e6',
              borderRadius: '12px',
              border: '1px solid #ffd700',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#856404', lineHeight: 1.6 }}>
                <strong>💡 Tip:</strong> You can always edit, add, or remove items after the plan is generated!
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
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
              <AutoAwesomeIcon style={{ width: '20px', height: '20px' }} />
              Generate Complete Event Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generating View
  if (view === 'generating') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '60px 40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 24px',
              border: '4px solid #6B7FD7',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#333', marginBottom: '12px' }}>
              Creating your event plan...
            </h2>
            
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6, marginBottom: '32px' }}>
              Our AI is generating a comprehensive plan for "{selectedConcept?.title}" with activities, schedules, shopping lists, and more.
            </p>

            <div style={{ 
              textAlign: 'left', 
              backgroundColor: '#f8f9ff', 
              padding: '20px', 
              borderRadius: '12px',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              <div style={{ marginBottom: '12px', opacity: 1 }}>✓ Analyzing event concept...</div>
              <div style={{ marginBottom: '12px', opacity: 0.7 }}>⏳ Generating activities...</div>
              <div style={{ marginBottom: '12px', opacity: 0.4 }}>⏳ Creating schedule...</div>
              <div style={{ opacity: 0.2 }}>⏳ Building shopping list...</div>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default ConceptsScreen;