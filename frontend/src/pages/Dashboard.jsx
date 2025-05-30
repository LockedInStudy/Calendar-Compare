// Dashboard Page Component
// This page shows the user's calendar events after they log in

// Import React and hooks for managing component state
import React, { useState, useEffect } from 'react';
// Import our EventList component
import EventList from '../components/EventList';
// Import group management components
import GroupList from '../components/GroupList';

// Dashboard component - the main page after login
function Dashboard({ onViewGroup }) {    // State variables to manage dashboard data and status
    // events: array of calendar events
    const [events, setEvents] = useState([]);
    
    // groups: array of user's groups
    const [groups, setGroups] = useState([]);
    
    // loading: tracks if we're currently fetching data
    const [loading, setLoading] = useState(false);
    
    // error: stores any error messages
    const [error, setError] = useState('');
    
    // isLoggedIn: tracks if user is authenticated
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // activeTab: tracks which tab is currently active ('events' or 'groups')
    const [activeTab, setActiveTab] = useState('events');    // useEffect hook runs when component first loads
    // This checks login status and fetches events if logged in
    useEffect(() => {
        checkLoginAndFetchData();
    }, []); // Empty dependency array means this runs only once

    // Function to check login status and fetch both events and groups
    const checkLoginAndFetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // First, check if user is logged in
            const statusResponse = await fetch('http://localhost:5000/auth/status', {
                credentials: 'include' // Include cookies/session data
            });
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                setIsLoggedIn(statusData.logged_in);
                
                // If user is logged in, fetch their events and groups
                if (statusData.logged_in) {
                    await Promise.all([
                        fetchEvents(),
                        fetchGroups()
                    ]);
                }
            } else {
                setIsLoggedIn(false);
                setError('Failed to check login status');
            }
            
        } catch (error) {
            console.error('Error checking login status:', error);
            setError('Failed to check authentication status');
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch calendar events from the backend
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Call our backend to get calendar events
            const response = await fetch('http://localhost:5000/calendar/events', {
                credentials: 'include' // Include cookies/session data
            });
            
            if (response.ok) {
                // Parse the JSON response
                const data = await response.json();
                
                // Update state with the fetched events
                setEvents(data.events || []);
                
            } else if (response.status === 401) {
                // 401 means unauthorized - user needs to log in
                setError('Please log in to view your calendar events');
                setIsLoggedIn(false);
            } else {
                // Other error
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch events');
            }
            
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };    // Function to manually refresh events
    const handleRefresh = () => {
        if (isLoggedIn) {
            if (activeTab === 'events') {
                fetchEvents();
            } else {
                fetchGroups();
            }
        }
    };

    // Function to fetch user's groups from the backend
    const fetchGroups = async () => {
        try {
            setError('');
            
            // Call our backend to get user's groups
            const response = await fetch('http://localhost:5000/groups', {
                credentials: 'include' // Include cookies/session data
            });
            
            if (response.ok) {
                // Parse the JSON response
                const data = await response.json();
                
                // Update state with the fetched groups
                setGroups(data.groups || []);
                
            } else if (response.status === 401) {
                // 401 means unauthorized - user needs to log in
                setError('Please log in to view your groups');
                setIsLoggedIn(false);
            } else {
                // Other error
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch groups');
            }
            
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError('Failed to connect to the server');
        }
    };

    // If user is not logged in, show message
    if (!isLoggedIn && !loading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <h2>📅 Dashboard</h2>
                <div style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <p>🔐 Please log in with Google to view your calendar events.</p>
                </div>
            </div>
        );
    }

    // JSX - The user interface for this component
    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            padding: '20px' 
        }}>            {/* Dashboard header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2>📅 Your Dashboard</h2>
                
                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Tab navigation */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #ddd',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => setActiveTab('events')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        backgroundColor: activeTab === 'events' ? '#007bff' : 'transparent',
                        color: activeTab === 'events' ? 'white' : '#007bff',
                        borderBottom: activeTab === 'events' ? 'none' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    📅 Calendar Events
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        backgroundColor: activeTab === 'groups' ? '#007bff' : 'transparent',
                        color: activeTab === 'groups' ? 'white' : '#007bff',
                        borderBottom: activeTab === 'groups' ? 'none' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    👥 My Groups
                </button>
            </div>

            {/* Show loading indicator */}
            {loading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#666'
                }}>
                    <div>🔄 Loading your calendar events...</div>
                    <small style={{ display: 'block', marginTop: '10px' }}>
                        This may take a few seconds
                    </small>
                </div>
            )}

            {/* Show error message if there is one */}
            {error && (
                <div style={{
                    color: 'red',
                    padding: '15px',
                    border: '1px solid red',
                    borderRadius: '5px',
                    backgroundColor: '#ffebee',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                    {error.includes('log in') && (
                        <div style={{ marginTop: '10px' }}>
                            <small>Please use the Login page to authenticate with Google.</small>
                        </div>
                    )}
                </div>
            )}            {/* Show events if we have them and no error */}
            {!loading && !error && isLoggedIn && (
                <div>
                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div>
                            {events.length > 0 ? (
                                <div>
                                    {/* Events summary */}
                                    <div style={{
                                        padding: '15px',
                                        backgroundColor: '#e8f5e8',
                                        border: '1px solid #28a745',
                                        borderRadius: '5px',
                                        marginBottom: '20px'
                                    }}>
                                        <strong>📊 Summary:</strong> Found {events.length} upcoming events
                                        <br />
                                        <small>Showing events from the next 30 days</small>
                                    </div>
                                    
                                    {/* Event list component */}
                                    <EventList events={events} />
                                </div>
                            ) : (
                                // No events found
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9'
                                }}>
                                    <h3>📭 No upcoming events</h3>
                                    <p>Your calendar appears to be free for the next 30 days!</p>
                                    <small style={{ color: '#666' }}>
                                        Note: Only events from your primary Google Calendar are shown
                                    </small>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Groups Tab */}
                    {activeTab === 'groups' && (
                        <div>
                            {groups.length > 0 ? (
                                <div>
                                    {/* Groups summary */}
                                    <div style={{
                                        padding: '15px',
                                        backgroundColor: '#e8f4f8',
                                        border: '1px solid #17a2b8',
                                        borderRadius: '5px',
                                        marginBottom: '20px'
                                    }}>
                                        <strong>👥 Summary:</strong> You are a member of {groups.length} group{groups.length === 1 ? '' : 's'}
                                        <br />
                                        <small>Click on any group to manage members and view details</small>
                                    </div>
                                    
                                    {/* Group list component */}
                                    <GroupList groups={groups} onViewGroup={onViewGroup} />
                                </div>
                            ) : (
                                // No groups found
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9'
                                }}>
                                    <h3>👥 No groups yet</h3>
                                    <p>You haven't created or joined any groups yet.</p>
                                    <div style={{ marginTop: '20px' }}>
                                        <p><strong>Get started:</strong></p>
                                        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                                            <li>Use "Create Group" to start a new team</li>
                                            <li>Use "Join Group" if you have an invitation code</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Export the component so other files can import and use it
export default Dashboard;
