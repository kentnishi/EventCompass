"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import { supabase } from '@/lib/supabase/client';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  attended_count?: number;
  location?: string;
  spent?: number;
  budget?: number;
  status: 'planning' | 'reservations' | 'promo' | 'purchases' | 'completed';
  committee?: string;
}

function EventCard({ event }: { event: Event; }) {
  const styles = {
    completed: { bg: '#119113ff', color: '#e7eeeaff', label: 'Complete' },
    planning: { bg: '#911111ff', color: '#e7eeeaff', label: 'Planning' },
    reservations: { bg: '#911111ff', color: '#e7eeeaff', label: 'Reservations' },
    promo: { bg: '#911111ff', color: '#e7eeeaff', label: 'Promotions' },
    purchases: { bg: '#911111ff', color: '#e7eeeaff', label: 'Purchasing' }
  };

  const getStatusStyle = (status: keyof typeof styles) => {
    return styles[status] || styles.completed;
  };

  const statusStyle = getStatusStyle(event.status);

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        // cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#333',
          margin: 0,
          flex: 1,
        }}>
          {event.name}
        </h3>
        {event.committee && (
          <span style={{
            backgroundColor: '#e8eaf6',
            color: '#5c6bc0',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginLeft: '12px',
          }}>
            {event.committee}
          </span>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p style={{
          fontSize: '0.95rem',
          color: '#666',
          marginBottom: '16px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {event.description}
        </p>
      )}

      {/* Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarTodayIcon style={{ fontSize: '1.1rem', color: '#888' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
              DATE
            </div>
            <div style={{ fontSize: '0.9rem', color: '#4a5676', fontWeight: 600 }}>
              {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PersonIcon style={{ fontSize: '1.1rem', color: '#888' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
              ATTENDEES
            </div>
            <div style={{ fontSize: '0.9rem', color: '#4a5676', fontWeight: 600 }}>
              {event.attended_count || 0}
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <LocationOnIcon style={{ fontSize: '1.1rem', color: '#888' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600}}>
              LOCATION
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#4a5676',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}>
              {event.location || 'TBD'}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AttachMoneyIcon style={{ fontSize: '1.1rem', color: '#888' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
              BUDGET
            </div>
            <div style={{ fontSize: '0.9rem', color: '#4a5676', fontWeight: 600 }}>

              {event.spent === -1 ? 0: event.spent} / {event.budget === -1 ? 0 : event.budget}
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '12px',
      }}>
        <span style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.color,
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {statusStyle.label}
        </span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('past_events')
        .select('*')
        .order('start_date', { ascending: true, nullsFirst: false });

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCommittee = filterCommittee === 'all' || event.committee === filterCommittee;
      return matchesSearch && matchesCommittee;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.start_date || '9999-12-31').getTime() - new Date(b.start_date || '9999-12-31').getTime();
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'budget') {
        return (b.budget || 0) - (a.budget || 0);
      } else if (sortBy === 'attendees') {
        return (b.attended_count || 0) - (a.attended_count || 0);
      }
      
      return 0;
    });

  // Get unique committees and statuses for filters
  const committees = ['all', ...new Set(events.filter(e => e.committee).map(e => e.committee))];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#d5dcf1',
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#4a5676',
          fontWeight: 600,
        }}>
          Loading events...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#d5dcf1',
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ color: '#f44336', fontSize: '1.2rem', fontWeight: 600 }}>
            Error loading events
          </div>
          <div style={{ color: '#666', marginTop: '10px' }}>
            {error}
          </div>
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#333',
            margin: 0,
            marginBottom: '8px',
          }}>
            Past Events
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0,
          }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: '16px',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <SearchIcon style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '1.3rem',
            }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                color: '#4a5676',
              }}
            />
          </div>

          {/* Committee Filter */}
          {/* <FilterListIcon style={{ color: '#888', fontSize: '1.2rem' }} /> */}
          <select
            value={filterCommittee}
            onChange={(e) => setFilterCommittee(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              color: '#4a5676',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#FFF',
            }}
          >
            {committees.map(committee => (
              <option key={committee} value={committee}>
                {committee === 'all' ? 'All Committees' : committee}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              color: '#4a5676',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#FFF',
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="budget">Sort by Budget</option>
            <option value="attendees">Sort by Attendees</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px',
          }}>
            📅
          </div>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 600,
            color: '#333',
            marginBottom: '8px',
          }}>
            No events found
          </h3>
          <p style={{
            fontSize: '1rem',
            color: '#666',
          }}>
            {searchQuery || filterCommittee !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first event to get started'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}>
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}              
            />
          ))}
        </div>
      )}
    </div>
  );
}
