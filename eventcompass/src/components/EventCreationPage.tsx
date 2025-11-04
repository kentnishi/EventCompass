"use client";

import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';

export default function EventCreationPage() {
  const [currentView, setCurrentView] = useState('questionnaire'); // questionnaire, plan-review, complete
  const [questionStep, setQuestionStep] = useState(0);
  const [showAISuggestion, setShowAISuggestion] = useState<string | null>(null);
  const [selectedStages, setSelectedStages] = useState<number[]>([]);

  const [eventData, setEventData] = useState({
    name: '',
    eventType: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    attendees: '',
    budget: '',
    description: '',
    goals: [] as string[],
  });

  const [customGoal, setCustomGoal] = useState('');

  const questions = [
    {
      id: 'basics',
      title: "Let's start with the basics",
      fields: [
        { name: 'name', label: 'Event Name', type: 'text', placeholder: 'e.g., UPBlackout' },
        { 
          name: 'eventType', 
          label: 'Event Type', 
          type: 'select', 
          options: ['Social', 'Academic', 'Cultural', 'Athletic', 'Fundraiser'] 
        },
      ]
    },
    {
      id: 'logistics',
      title: "When and where?",
      fields: [
        { name: 'date', label: 'Start Date', type: 'date' },
        { name: 'time', label: 'Start Time', type: 'time' },
        { name: 'endDate', label: 'End Date', type: 'date' },
        { name: 'endTime', label: 'End Time', type: 'time' },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Guilford House', aiSuggest: true }
      ]
    },
    {
      id: 'scale',
      title: "Let's talk numbers",
      fields: [
        { name: 'attendees', label: 'Expected Attendees', type: 'number', placeholder: '100', aiSuggest: true },
        { name: 'budget', label: 'Total Budget ($)', type: 'number', placeholder: '3400', aiSuggest: true }
      ]
    },
    {
      id: 'vision',
      title: "Tell us about your vision",
      fields: [
        { name: 'description', label: 'Event Description', type: 'textarea', placeholder: 'What makes this event special?', aiSuggest: true },
      ]
    }
  ];

  const aiLocationSuggestions = [
    "Thwing Ballroom (Capacity: 200, $800/hr)",
    "Guilford House (Capacity: 150, $600/hr)",
    "Tinkham Veale Ballroom (Capacity: 180, $750/hr)"
  ];

  const aiDescriptionSuggestion = "Transform your venue into an unforgettable experience where students connect, celebrate, and create lasting memories. This event will feature engaging activities, themed decorations, and opportunities for community building.";

  const suggestedPlan = [
    {
      id: 1,
      name: "Initial Planning",
      confidence: "high",
      reason: "Essential for all events",
      selected: true,
      taskCount: 4,
    },
    {
      id: 2,
      name: "Budget & Venue",
      confidence: "high",
      reason: "Critical for 100+ attendee events",
      selected: true,
      taskCount: 4,
    },
    {
      id: 3,
      name: "Vendor Coordination",
      confidence: "high",
      reason: "Your budget supports multiple vendors",
      selected: true,
      taskCount: 4,
    },
    {
      id: 4,
      name: "Promotion & Registration",
      confidence: "medium",
      reason: "Recommended for public events",
      selected: true,
      taskCount: 5,
    },
    {
      id: 5,
      name: "Day-of Logistics",
      confidence: "medium",
      reason: "Optional but helpful for smooth execution",
      selected: false,
      taskCount: 5,
    },
    {
      id: 6,
      name: "Post-Event Wrap-up",
      confidence: "low",
      reason: "Nice to have for continuous improvement",
      selected: false,
      taskCount: 3,
    }
  ];

  const handleQuestionSubmit = () => {
    if (questionStep < questions.length - 1) {
      setQuestionStep(questionStep + 1);
    } else {
      setCurrentView('plan-review');
      setSelectedStages(suggestedPlan.filter(s => s.selected).map(s => s.id));
    }
  };

  const handleStageToggle = (stageId: number) => {
    if (selectedStages.includes(stageId)) {
      setSelectedStages(selectedStages.filter(id => id !== stageId));
    } else {
      setSelectedStages([...selectedStages, stageId]);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
      medium: { bg: '#fff8e1', text: '#f57f17', border: '#ffc107' },
      low: { bg: '#f5f5f5', text: '#666', border: '#999' }
    };
    return colors[confidence as keyof typeof colors] || colors.low;
  };

  const addCustomGoal = () => {
    if (customGoal.trim()) {
      setEventData({
        ...eventData,
        goals: [...eventData.goals, customGoal]
      });
      setCustomGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setEventData({
      ...eventData,
      goals: eventData.goals.filter((_, i) => i !== index)
    });
  };

  // QUESTIONNAIRE VIEW
  if (currentView === 'questionnaire') {
    const currentQuestion = questions[questionStep];
    
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#d5dcf1',
        padding: '30px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#333',
                margin: 0,
              }}>
                Create Your Event
              </h1>
              <span style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 600,
              }}>
                Step {questionStep + 1} of {questions.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${((questionStep + 1) / questions.length) * 100}%`,
                height: '100%',
                backgroundColor: '#6B7FD7',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#333',
              marginBottom: '32px',
            }}>
              {currentQuestion.title}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {currentQuestion.fields.map((field) => (
                <div key={field.name}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#4a5676',
                    marginBottom: '8px',
                  }}>
                    <span>{field.label}</span>
                    {field.aiSuggest && (
                      <button 
                        onClick={() => setShowAISuggestion(showAISuggestion === field.name ? null : field.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f8f9ff',
                          color: '#6B7FD7',
                          border: '1px solid #6B7FD7',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <AutoAwesomeIcon style={{ fontSize: '0.9rem' }} />
                        AI Suggest
                      </button>
                    )}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <select
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  
                  {field.type === 'date' && (
                    <input
                      type="date"
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  
                  {field.type === 'time' && (
                    <input
                      type="time"
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      rows={4}
                      value={eventData[field.name as keyof typeof eventData] as string}
                      onChange={(e) => setEventData({...eventData, [field.name]: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                        resize: 'vertical',
                      }}
                    />
                  )}
                  
                  {showAISuggestion === field.name && (
                    <div style={{
                      marginTop: '12px',
                      padding: '16px',
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #6B7FD7',
                      borderRadius: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}>
                        <AutoAwesomeIcon style={{ fontSize: '1.2rem', color: '#6B7FD7', marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#6B7FD7',
                            marginBottom: '8px',
                          }}>
                            AI Suggestions:
                          </div>
                          {field.name === 'location' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {aiLocationSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setEventData({...eventData, location: suggestion.split(' (')[0]});
                                    setShowAISuggestion(null);
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    backgroundColor: '#FFF',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    color: '#4a5676',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                          {field.name === 'description' && (
                            <button
                              onClick={() => {
                                setEventData({...eventData, description: aiDescriptionSuggestion});
                                setShowAISuggestion(null);
                              }}
                              style={{
                                padding: '10px 12px',
                                backgroundColor: '#FFF',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                textAlign: 'left',
                                fontSize: '0.9rem',
                                color: '#4a5676',
                                cursor: 'pointer',
                                width: '100%',
                              }}
                            >
                              {aiDescriptionSuggestion}
                            </button>
                          )}
                          {field.name === 'attendees' && (
                            <div style={{ fontSize: '0.9rem', color: '#4a5676' }}>
                              Based on similar events, expect 80-150 attendees for a {eventData.eventType || 'social'} event
                            </div>
                          )}
                          {field.name === 'budget' && (
                            <div style={{ fontSize: '0.9rem', color: '#4a5676' }}>
                              Recommended budget: $2,500-4,000 for {eventData.attendees || '100'} attendees
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Event Goals Section (on vision step) */}
              {currentQuestion.id === 'vision' && (
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#4a5676',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Event Goals
                  </label>
                  
                  {eventData.goals.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      {eventData.goals.map((goal, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#e8f5e9',
                            border: '1px solid #4caf50',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            color: '#2e7d32',
                          }}
                        >
                          <CheckCircleIcon style={{ fontSize: '1rem' }} />
                          {goal}
                          <button
                            onClick={() => removeGoal(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2e7d32',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: 0,
                              marginLeft: '4px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                  }}>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
                      placeholder="Add an event goal..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#4a5676',
                        fontWeight: 500,
                      }}
                    />
                    <button
                      onClick={addCustomGoal}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#6B7FD7',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AddIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '40px',
            }}>
              <button
                onClick={() => setQuestionStep(Math.max(0, questionStep - 1))}
                disabled={questionStep === 0}
                style={{
                  padding: '12px 32px',
                  backgroundColor: questionStep === 0 ? '#e0e0e0' : '#f5f5f5',
                  color: questionStep === 0 ? '#999' : '#4a5676',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: questionStep === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ArrowBackIcon />
                Back
              </button>
              <button
                onClick={handleQuestionSubmit}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#6B7FD7',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {questionStep === questions.length - 1 ? (
                  <>
                    <AutoAwesomeIcon />
                    Generate Plan
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowForwardIcon />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAN REVIEW VIEW
  if (currentView === 'plan-review') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#d5dcf1',
        padding: '30px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#333',
              marginBottom: '12px',
            }}>
              Your Custom Event Plan
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              margin: 0,
            }}>
              We've created a plan based on your inputs. Select the stages you want to include.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {suggestedPlan.map((stage) => {
              const colors = getConfidenceBadge(stage.confidence);
              const isSelected = selectedStages.includes(stage.id);
              
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageToggle(stage.id)}
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
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '12px',
                      }}>
                        {isSelected ? (
                          <CheckCircleIcon style={{ fontSize: '2rem', color: '#6B7FD7' }} />
                        ) : (
                          <RadioButtonUncheckedIcon style={{ fontSize: '2rem', color: '#ccc' }} />
                        )}
                        <div>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#333',
                            margin: 0,
                            marginBottom: '4px',
                          }}>
                            {stage.name}
                          </h3>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            margin: 0,
                          }}>
                            {stage.reason}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '12px',
                        marginLeft: '56px',
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}>
                          {stage.confidence} confidence
                        </span>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#999',
                          fontWeight: 600,
                        }}>
                          {stage.taskCount} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add Custom Stage */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '40px',
          }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              backgroundColor: '#f8f9ff',
              color: '#6B7FD7',
              border: '2px dashed #6B7FD7',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              <AddIcon />
              Add Custom Stage
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setCurrentView('questionnaire')}
              style={{
                padding: '12px 32px',
                backgroundColor: '#f5f5f5',
                color: '#4a5676',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowBackIcon />
              Back to Questions
            </button>
            <button
              onClick={() => setCurrentView('complete')}
              disabled={selectedStages.length === 0}
              style={{
                padding: '12px 32px',
                backgroundColor: selectedStages.length === 0 ? '#ccc' : '#6B7FD7',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: selectedStages.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Create Event
              <ArrowForwardIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE VIEW
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#d5dcf1',
      padding: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '60px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        <CheckCircleIcon style={{ fontSize: '5rem', color: '#4caf50', marginBottom: '24px' }} />
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#333',
          marginBottom: '16px',
        }}>
          Event Created Successfully!
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          marginBottom: '32px',
        }}>
          Your event "{eventData.name}" has been created with {selectedStages.length} planning stages.
        </p>
        <button
          onClick={() => window.location.href = '/events'}
          style={{
            padding: '14px 40px',
            backgroundColor: '#6B7FD7',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to Event Dashboard
        </button>
      </div>
    </div>
  );
}