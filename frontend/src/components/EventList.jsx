// EventList Component
// This component displays a list of calendar events in a nice format

// Import React
import React from 'react';

// EventList component - displays an array of calendar events
function EventList({ events }) {
    // Helper function to format dates in a readable way
    const formatDateTime = (dateTimeString) => {
        try {
            // Create a Date object from the ISO string
            const date = new Date(dateTimeString);
            
            // Format the date and time in a readable format
            // Example: "Dec 25, 2023 at 2:30 PM"
            return date.toLocaleDateString('en-US', {
                weekday: 'short',  // Mon, Tue, etc.
                year: 'numeric',   // 2023
                month: 'short',    // Jan, Feb, etc.
                day: 'numeric',    // 1, 2, etc.
                hour: 'numeric',   // 1, 2, etc.
                minute: '2-digit', // 01, 02, etc.
                hour12: true       // Use AM/PM format
            });
        } catch (error) {
            // If date formatting fails, return the original string
            return dateTimeString;
        }
    };

    // Helper function to calculate duration in a readable format
    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours}h`;
            } else {
                return `${hours}h ${remainingMinutes}m`;
            }
        }
    };

    // Helper function to get a color for the event based on its properties
    const getEventColor = (event) => {
        // Use different colors based on event status or type
        if (event.status === 'tentative') {
            return '#ffc107'; // Yellow for tentative
        } else if (event.all_day) {
            return '#28a745'; // Green for all-day events
        } else {
            return '#007bff'; // Blue for regular events
        }
    };

    // If no events provided, show a message
    if (!events || events.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666'
            }}>
                No events to display
            </div>
        );
    }

    // JSX - The user interface for this component
    return (
        <div>
            <h3>📋 Upcoming Events ({events.length})</h3>
            
            {/* Container for all events */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px' 
            }}>
                {/* Map over each event and create a card for it */}
                {events.map((event, index) => (
                    <div 
                        key={event.id || index} // Use event ID or index as unique key
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${getEventColor(event)}` // Colored left border
                        }}
                    >
                        {/* Event header with title and status */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '10px'
                        }}>
                            {/* Event title */}
                            <h4 style={{ 
                                margin: '0',
                                color: '#333',
                                fontSize: '18px'
                            }}>
                                {event.summary || 'Untitled Event'}
                            </h4>
                            
                            {/* Event status badge */}
                            <span style={{
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: event.status === 'confirmed' ? '#28a745' : '#ffc107',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {event.status || 'confirmed'}
                            </span>
                        </div>

                        {/* Event timing information */}
                        <div style={{ marginBottom: '10px' }}>
                            {event.all_day ? (
                                // All-day event
                                <div style={{ color: '#666' }}>
                                    📅 <strong>All Day Event</strong>
                                    <br />
                                    {formatDateTime(event.start).split(' at ')[0]} {/* Just the date part */}
                                </div>
                            ) : (
                                // Regular timed event
                                <div style={{ color: '#666' }}>
                                    🕐 <strong>Start:</strong> {formatDateTime(event.start)}
                                    <br />
                                    🕐 <strong>End:</strong> {formatDateTime(event.end)}
                                    <br />
                                    ⏱️ <strong>Duration:</strong> {formatDuration(event.duration_minutes || 0)}
                                </div>
                            )}
                        </div>

                        {/* Event description (if available) */}
                        {event.description && (
                            <div style={{ 
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}>
                                <strong>📝 Description:</strong>
                                <div style={{ marginTop: '5px' }}>
                                    {event.description.length > 150 
                                        ? event.description.substring(0, 150) + '...' 
                                        : event.description
                                    }
                                </div>
                            </div>
                        )}

                        {/* Event location (if available) */}
                        {event.location && (
                            <div style={{ marginBottom: '10px', color: '#666' }}>
                                📍 <strong>Location:</strong> {event.location}
                            </div>
                        )}

                        {/* Additional event details */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px',
                            paddingTop: '10px',
                            borderTop: '1px solid #eee',
                            fontSize: '12px',
                            color: '#888'
                        }}>
                            {/* Attendees count */}
                            <span>
                                👥 {event.attendees_count || 0} attendee{(event.attendees_count || 0) !== 1 ? 's' : ''}
                            </span>
                            
                            {/* Event creator */}
                            {event.creator_email && (
                                <span>
                                    👤 {event.creator_email}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer note */}
            <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center'
            }}>
                💡 <strong>Tip:</strong> This shows events from your primary Google Calendar for the next 30 days
            </div>
        </div>
    );
}

// Export the component so other files can import and use it
export default EventList;
