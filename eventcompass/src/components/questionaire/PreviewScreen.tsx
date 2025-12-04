import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Concept } from '@/types/eventPlan';

interface PreviewScreenProps {
  selectedConcept: Concept;
  customizations: {
    includeActivities: boolean;
    includeSchedule: boolean;
    includeShopping: boolean;
    includeTasks: boolean;
    includeBudget: boolean;
  };
  setCustomizations: (customizations: any) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ConceptCustomization = ({
  selectedConcept,
  customizations,
  setCustomizations,
  onBack,
  onGenerate,
  isGenerating
}: PreviewScreenProps) => {
  console.log("Selected Concept:", selectedConcept);

  // Handle checkbox changes with dependency logic
  const handleCheckboxChange = (key: string, checked: boolean) => {
    const newCustomizations = { ...customizations, [key]: checked };

    // If unchecking activities, also uncheck schedule
    if (key === 'includeActivities' && !checked) {
      newCustomizations.includeSchedule = false;
    }

    // If unchecking budget, also uncheck shopping
    if (key === 'includeBudget' && !checked) {
      newCustomizations.includeShopping = false;
    }

    // If checking schedule, ensure activities is checked
    if (key === 'includeSchedule' && checked) {
      newCustomizations.includeActivities = true;
    }

    // If checking shopping, ensure budget is checked
    if (key === 'includeShopping' && checked) {
      newCustomizations.includeBudget = true;
    }

    setCustomizations(newCustomizations);
  };

  const items = [
    { 
      key: 'includeActivities', 
      label: 'Detailed Activities', 
      desc: 'Breakdown of all event activities with descriptions and staffing needs',
      isDisabled: false,
      disabledReason: ''
    },
    { 
      key: 'includeSchedule', 
      label: 'Complete Schedule', 
      desc: 'Timeline with start/end times for each activity',
      isDisabled: !customizations.includeActivities,
      disabledReason: 'Requires "Detailed Activities" to be selected'
    },
    { 
      key: 'includeShopping', 
      label: 'Shopping List', 
      desc: 'Materials, supplies, and food items with quantities and vendors',
      isDisabled: !customizations.includeBudget,
      disabledReason: 'Requires "Budget Breakdown" to be selected'
    },
    { 
      key: 'includeTasks', 
      label: 'Task Checklist', 
      desc: 'Action items with assignments, deadlines, and priorities',
      isDisabled: false,
      disabledReason: ''
    },
    { 
      key: 'includeBudget', 
      label: 'Budget Breakdown', 
      desc: 'Category allocations and spending tracking',
      isDisabled: false,
      disabledReason: ''
    }
  ];

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
              {items.map(item => {
                const isChecked = customizations[item.key];
                const isDisabled = item.isDisabled;

                return (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: isDisabled ? '#f5f5f5' : (isChecked ? '#f8f9ff' : '#fafafa'),
                      border: isChecked ? '2px solid #6B7FD7' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        cursor: isDisabled ? 'not-allowed' : 'pointer', 
                        marginTop: '4px' 
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: isDisabled ? '#999' : '#666' }}>
                        {item.desc}
                      </div>
                      {isDisabled && (
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#FF6B6B', 
                          marginTop: '6px',
                          fontStyle: 'italic'
                        }}>
                          ⓘ {item.disabledReason}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
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
            onClick={onGenerate}
            style={{
              width: '100%',
              padding: '16px 32px',
              backgroundColor: '#6B7FD7',
              color: '#FFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(107, 127, 215, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isGenerating ? 0.7 : 1
            }}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <AutoAwesomeIcon style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                Generating Plan...
              </>
            ) : (
              <>
                <AutoAwesomeIcon style={{ width: '20px', height: '20px' }} />
                Generate Complete Event Plan
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConceptCustomization;