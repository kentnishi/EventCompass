"use client";

import React, { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface EventInfo {
  attendees: number;
  budget: number;
  committee: string;
  created_at: string; // ISO date string
  description: string;
  end_date: string; // ISO date string
  end_time: string; // Time in HH:mm:ss format
  id: string; // UUID
  location: string;
  name: string;
  spending: number | null; // Nullable number
  start_date: string; // ISO date string
  start_time: string; // Time in HH:mm:ss format
  status: "planning" | "reservations" | "promo" | "purchases"; // Enum for status
}

export default function EventPlanningPage({ id }: { id: string }) {
  const eventID = id;

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  // const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalEventInfo, setOriginalEventInfo] = useState<EventInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch event data using the event ID from params
    if (!eventID) {
      console.error("Event ID is missing");
      return;
    }
    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventID}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }
        const data = await response.json();
        console.log("response: ", data);
        setEventInfo(data.event);
        setTasks(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (eventID) {
      fetchEvent();
    }
  }, [eventID]);

    // Update event function
  async function updateEvent() {
    if (!eventInfo) return;

    try {
      setIsSaving(true);
      

      console.log('Updating event with ID:', eventID);
      console.log('Event data:', eventInfo);
      
      const response = await fetch(`/api/events/${eventID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventInfo.name,
          description: eventInfo.description,
          attendees: eventInfo.attendees,
          start_date: eventInfo.start_date,
          end_date: eventInfo.end_date,
          start_time: eventInfo.start_time,
          end_time: eventInfo.end_time,
          budget: eventInfo.budget,
          spending: eventInfo.spending,
          location: eventInfo.location,
          committee: eventInfo.committee,
          status: eventInfo.status,
        }),
      });

      
      console.log(response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to update event: ${errorText}`);
      }

      const result = await response.json();
      console.log('Update result:', result);

      // Update both current and original state
      setEventInfo(result.event);
      setOriginalEventInfo(result.event);
      setIsEditing(false);
      alert('Event updated successfully!');
    } catch (err: any) {
      console.error('Error updating event:', err);
      alert(`Failed to update event: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }
  
    // Cancel editing and restore original values
    function cancelEdit() {
      if (originalEventInfo) {
        setEventInfo(originalEventInfo);
      }
      setIsEditing(false);
    }




  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finalize venue booking', completed: true, assignees: 2 },
    { id: 2, title: 'Confirm vendor contracts', completed: true, assignees: 1 },
    { id: 3, title: 'Send promotional materials', completed: false, assignees: 3 },
    { id: 4, title: 'Purchase supplies', completed: false, assignees: 2 },
    { id: 5, title: 'Setup day-of logistics', completed: false, assignees: 2 },
  ]);

  const planningStages = [
    { name: 'Planning', completed: true },
    { name: 'Reservations', completed: true },
    { name: 'Purchases', completed: false },
    { name: 'Promo', completed: false },
  ];

  const aiSuggestions = {
    budget: {
      total: 3000,
      breakdown: [
        { category: 'Food', amount: 1650, trend: 'up', change: 53 },
        { category: 'Venue', amount: 800, trend: 'neutral', change: 0 },
        { category: 'Activities', amount: 350, trend: 'down', change: -5 },
        { category: 'Misc', amount: 200, trend: 'neutral', change: 0 },
      ],
      recommendation: 'Your budget is well-distributed. Consider allocating an extra $100 for promotional materials.',
    },
    locations: [
      { name: 'Thwing Ballroom', capacity: 200, price: 800, rating: 4.5, available: true },
      { name: 'Tinkham Veale Ballroom A', capacity: 150, price: 650, rating: 4.3, available: true },
      { name: 'Tinkham Veale Ballroom B', capacity: 180, price: 750, rating: 4.4, available: true },
    ],
    vendors: [
      { name: 'Ice or Rice', type: 'Food', price: 2000, rating: 4.5, specialty: 'Asian Fusion' },
      { name: 'Thai Life', type: 'Food', price: 1200, rating: 4.2, specialty: 'Thai Cuisine' },
      { name: 'Piada', type: 'Food', price: 1500, rating: 4.0, specialty: 'Italian Bowls' },
    ],
    activities: [
      { name: 'Bento Box Workshop', duration: '1 hour', cost: 350, engagement: 'High' },
      { name: 'Cultural Performance', duration: '30 mins', cost: 500, engagement: 'Medium' },
      { name: 'Photo Booth', duration: '2 hours', cost: 400, engagement: 'High' },
    ],
  };

  if (loading || !eventInfo) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#d5dcf1",
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            color: "#4a5676",
            fontWeight: 600,
          }}
        >
          Loading event details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#d5dcf1",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ color: "#f44336", fontSize: "1.2rem", fontWeight: 600 }}>
            Error loading event
          </div>
          <div style={{ color: "#666", marginTop: "10px" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#d5dcf1',
      padding: '30px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px',
      }}>
        {/* Main Content */}
        <div>
          {/* Essential Information Section */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#333',
                margin: 0,
              }}>
                {eventInfo.name}
              </h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit Details
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={updateEvent}
                    disabled={isSaving}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: isSaving ? '#ccc' : '#4caf50',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#f5f5f5',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              // View Mode
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  {/* Start Date & Time */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <CalendarTodayIcon style={{ fontSize: '1rem' }} />
                      Start Date & Time
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                    }}>
                      {new Date(eventInfo.start_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      marginTop: '4px',
                    }}>
                      {eventInfo?.start_time ? eventInfo.start_time.slice(0, 5) : "N/A"}

                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <CalendarTodayIcon style={{ fontSize: '1rem' }} />
                      End Date & Time
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                    }}>
                      {new Date(eventInfo.end_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      marginTop: '4px',
                    }}>
                      {eventInfo?.end_time ? eventInfo.end_time.slice(0, 5) : "N/A"}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <LocationOnIcon style={{ fontSize: '1rem' }} />
                      Location
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                    }}>
                      {eventInfo.location}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <AttachMoneyIcon style={{ fontSize: '1rem' }} />
                      Budget
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                    }}>
                        {eventInfo.budget === -1 ? 'N/A' : `$${eventInfo.budget}`}
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <PersonIcon style={{ fontSize: '1rem' }} />
                      Expected Attendees
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                    }}>
                      {eventInfo.attendees} people
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                    }}>
                      Status
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#4a5676',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {eventInfo.status}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    Event Description
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#4a5676',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                  }}>
                    {eventInfo.description}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px',
                  marginBottom: '24px',
                }}>
                  {/* Start Date & Time */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      <CalendarTodayIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px' }} />
                      Start Date & Time
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}>
                      <input
                        type="date"
                        value={eventInfo.start_date}
                        onChange={(e) => setEventInfo({...eventInfo, start_date: e.target.value})}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '0.95rem',
                          color: '#4a5676',
                          fontWeight: 600,
                        }}
                      />
                      <input
                        type="time"
                        value={eventInfo.start_time}
                        onChange={(e) => setEventInfo({...eventInfo, start_time: e.target.value})}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '0.95rem',
                          color: '#4a5676',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      End Date & Time
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}>
                      <input
                        type="date"
                        value={eventInfo.end_date}
                        onChange={(e) => setEventInfo({...eventInfo, end_date: e.target.value})}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '0.95rem',
                          color: '#4a5676',
                          fontWeight: 600,
                        }}
                      />
                      <input
                        type="time"
                        value={eventInfo.end_time}
                        onChange={(e) => setEventInfo({...eventInfo, end_time: e.target.value})}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '0.95rem',
                          color: '#4a5676',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      <LocationOnIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px' }} />
                      Location
                    </label>
                    <input
                      type="text"
                      value={eventInfo.location}
                      onChange={(e) => setEventInfo({...eventInfo, location: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '0.95rem',
                        color: '#4a5676',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      <AttachMoneyIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px' }} />
                      Budget
                    </label>
                    <input
                      type="number"
                      value={eventInfo.budget !== null && eventInfo.budget !== undefined ? eventInfo.budget : 0}
                      onChange={(e) => setEventInfo({ ...eventInfo, budget: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '0.95rem',
                        color: '#4a5676',
                        fontWeight: 600,
                      }}
                    >
                    </input>
                  </div>

                  {/* Attendees */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      <PersonIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px' }} />
                      Expected Attendees
                    </label>
                    <input
                      type="number"
                      value={eventInfo.attendees}
                      onChange={(e) => setEventInfo({...eventInfo, attendees: parseInt(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '0.95rem',
                        color: '#4a5676',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      Status
                    </label>
                    <select
                      value={eventInfo.status}
                      onChange={(e) => setEventInfo({...eventInfo, status: e.target.value as EventInfo['status']})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '0.95rem',
                        color: '#4a5676',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="planning">Planning</option>
                      <option value="reservations">Reservations</option>
                      <option value="purchases">Purchases</option>
                      <option value="promo">Promo</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Event Description
                  </label>
                  <textarea
                    value={eventInfo.description}
                    onChange={(e) => setEventInfo({...eventInfo, description: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '0.95rem',
                      color: '#4a5676',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            )}

            {!isEditing && (
              <button style={{
                marginTop: '20px',
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
              }}>
                <AutoAwesomeIcon />
                Generate AI Suggestions
              </button>
            )}
          </div>
        

          {/* AI Suggestions Section */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <AutoAwesomeIcon style={{ fontSize: '2rem', color: '#6B7FD7' }} />
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#333',
                margin: 0,
              }}>
                AI Suggestions
              </h2>
            </div>

            {/* Budget Suggestions */}
            <div style={{
              backgroundColor: '#f8f9ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#333',
                  margin: 0,
                }}>
                  Budget Breakdown
                </h3>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4].map((star) => (
                    <StarIcon key={star} style={{ fontSize: '1.2rem', color: '#ffc107' }} />
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '16px',
              }}>
                {aiSuggestions.budget.breakdown.map((item) => (
                  <div key={item.category} style={{
                    backgroundColor: '#FFF',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                      {item.category}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4a5676', marginBottom: '4px' }}>
                      ${item.amount}
                    </div>
                    {item.trend === 'up' && (
                      <div style={{ fontSize: '0.85rem', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <TrendingUpIcon style={{ fontSize: '1rem' }} />
                        +${item.change}
                      </div>
                    )}
                    {item.trend === 'down' && (
                      <div style={{ fontSize: '0.85rem', color: '#f44336', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <TrendingDownIcon style={{ fontSize: '1rem' }} />
                        ${item.change}
                      </div>
                    )}
                    {item.trend === 'neutral' && (
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        No change
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{
                backgroundColor: '#e8f5e9',
                padding: '12px 16px',
                borderRadius: '8px',
                borderLeft: '4px solid #4caf50',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#2e7d32', fontWeight: 600 }}>
                  💡 {aiSuggestions.budget.recommendation}
                </div>
              </div>
            </div>

            {/* Location Suggestions */}
            <div style={{
              backgroundColor: '#fff8e1',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '16px',
              }}>
                Recommended Locations
              </h3>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {aiSuggestions.locations.map((location) => (
                  <div key={location.name} style={{
                    backgroundColor: '#FFF',
                    padding: '16px',
                    borderRadius: '8px',
                    flex: '1 1 280px',
                    border: location.name === eventInfo.location ? '2px solid #6B7FD7' : '1px solid #ddd',
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                      {location.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                      Capacity: {location.capacity} | ${location.price}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon
                          key={i}
                          style={{
                            fontSize: '1rem',
                            color: i < Math.floor(location.rating) ? '#ffc107' : '#ddd',
                          }}
                        />
                      ))}
                      <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '4px' }}>
                        {location.rating}
                      </span>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#6B7FD7',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                    }}>
                      Reserve
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Suggestions */}
            <div style={{
              backgroundColor: '#fce4ec',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '16px',
              }}>
                Suggested Vendors
              </h3>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {aiSuggestions.vendors.map((vendor) => (
                  <div key={vendor.name} style={{
                    backgroundColor: '#FFF',
                    padding: '16px',
                    borderRadius: '8px',
                    flex: '1 1 280px',
                    border: '1px solid #ddd',
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                      {vendor.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>
                      {vendor.specialty}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                      ${vendor.price}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon
                          key={i}
                          style={{
                            fontSize: '1rem',
                            color: i < Math.floor(vendor.rating) ? '#ffc107' : '#ddd',
                          }}
                        />
                      ))}
                      <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '4px' }}>
                        {vendor.rating}
                      </span>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#ec407a',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                    }}>
                      Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Suggestions */}
            <div style={{
              backgroundColor: '#e8f5e9',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '16px',
              }}>
                Activity Ideas
              </h3>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {aiSuggestions.activities.map((activity) => (
                  <div key={activity.name} style={{
                    backgroundColor: '#FFF',
                    padding: '16px',
                    borderRadius: '8px',
                    flex: '1 1 280px',
                    border: '1px solid #ddd',
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                      {activity.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                      Duration: {activity.duration}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#4a5676', fontWeight: 600 }}>
                        ${activity.cost}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        backgroundColor: activity.engagement === 'High' ? '#4caf50' : '#ff9800',
                        color: '#FFF',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        {activity.engagement} Engagement
                      </span>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#66bb6a',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                    }}>
                      Add to Event
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Planning Progress Tracker */}
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              Planning Progress
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              position: 'relative',
            }}>
              {planningStages.map((stage, index) => (
                <React.Fragment key={stage.name}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 2,
                  }}>
                    {stage.completed ? (
                      <CheckCircleIcon style={{ fontSize: '3rem', color: '#4caf50' }} />
                    ) : (
                      <RadioButtonUncheckedIcon style={{ fontSize: '3rem', color: '#ccc' }} />
                    )}
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: stage.completed ? '#4a5676' : '#999',
                    }}>
                      {stage.name}
                    </span>
                  </div>
                  {index < planningStages.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: stage.completed && planningStages[index + 1].completed ? '#4caf50' : '#ddd',
                      marginBottom: '40px',
                      maxWidth: '150px',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Todo List */}
        <div>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '30px',
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px',
            }}>
              Todo List
            </h3>

            <div style={{ marginBottom: '20px' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: task.completed ? '#f5f5f5' : '#FFF',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {
                      setTasks(tasks.map(t =>
                        t.id === task.id ? {...t, completed: !t.completed} : t
                      ));
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    flex: 1,
                    color: task.completed ? '#999' : '#4a5676',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {Array.from({ length: task.assignees }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#7986cb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon style={{ fontSize: '0.85rem', color: '#FFF' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4a5676',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              + Add Task
            </button>

            {/* Progress Summary */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9ff',
              borderRadius: '8px',
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '8px',
              }}>
                Tasks Completed
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#4a5676',
                marginBottom: '8px',
              }}>
                {tasks.filter(t => t.completed).length} / {tasks.length}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#4caf50',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}