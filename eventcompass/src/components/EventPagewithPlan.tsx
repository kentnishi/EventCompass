"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '@/lib/supabase/client';

interface Event {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    attendees?: number;
    location?: string;
    spending?: number;
    budget?: number;
    status: 'planning' | 'in_progress' | 'ready' | 'completed';
    committee?: string;
    created_at?: string; // Added created_at property
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
    // Status badge styling
    const styles = {
        planning: { bg: '#e3f2fd', color: '#1976d2', label: 'Planning' },
        in_progress: { bg: '#fff3e0', color: '#f57c00', label: 'In Progress' },
        ready: { bg: '#e8f5e9', color: '#388e3c', label: 'Ready' },
        completed: { bg: '#f3e5f5', color: '#7b1fa2', label: 'Completed' },
    };

    const getStatusStyle = (status: keyof typeof styles) => {
        return styles[status] || styles.planning;
    };

    const statusStyle = getStatusStyle(event.status);

    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: '#FFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e0e0e0',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
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
                            {event.attendees || 0}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LocationOnIcon style={{ fontSize: '1.1rem', color: '#888' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
                            LOCATION
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#4a5676',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
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

                            {event.spending === -1 ? 0 : event.spending} / {event.budget === -1 ? 0 : event.budget}
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

export default function EventsPage({ filterByStatus }: { filterByStatus?: string }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCommittee, setFilterCommittee] = useState('all');
    const [filterStatus, setFilterStatus] = useState(filterByStatus || 'all');
    const [sortBy, setSortBy] = useState('created_date');

    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: true, nullsFirst: false });

            if (fetchError) throw fetchError;
            setEvents(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    }

    async function createEvent() {
        console.log("Created new event");
        router.push(`/events/new`)
    }

    // Filter and sort events
    const filteredEvents = events
        .filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCommittee = filterCommittee === 'all' || event.committee === filterCommittee;
            const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
            return matchesSearch && matchesCommittee && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.start_date || '9999-12-31').getTime() - new Date(b.start_date || '9999-12-31').getTime();
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'budget') {
                return (b.budget || 0) - (a.budget || 0);
            } else if (sortBy === 'created_date') {
                return new Date(a.created_at || '9999-12-31').getTime() - new Date(b.created_at || '9999-12-31').getTime();
            }
            return 0;
        });

    // Get unique committees and statuses for filters
    const committees = ['all', ...new Set(events.filter(e => e.committee).map(e => e.committee))];
    const statuses = ['planning', 'in_progress', 'ready', 'completed'];

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
                        All Events
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#666',
                        margin: 0,
                    }}>
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
                    </p>
                </div>
                <button
                    onClick={() => createEvent()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#6B7FD7',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(107, 127, 215, 0.3)',
                    }}
                >
                    <AddIcon style={{ fontSize: '1.3rem' }} />
                    New Event
                </button>
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

                    {/* Status Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FilterListIcon style={{ color: '#888', fontSize: '1.2rem' }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Committee Filter */}
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
                        <option value="date">Sort by Event Date</option>
                        <option value="created_date">Sort by Date Created</option>
                        <option value="name">Sort by Name</option>
                        <option value="budget">Sort by Budget</option>
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
                        {searchQuery || filterCommittee !== 'all' || filterStatus !== 'all'
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
                            onClick={() => {
                                const route = event.status === "planning" ? `/event-plans/${event.id}` : `/events/${event.id}`;
                                router.push(route);
                            }}

                        />
                    ))}
                </div>
            )}
        </div>
    );
}