import React, { useState, useEffect } from 'react';
import '../styles/GroupCalendar.css';

/**
 * GroupCalendar Component
 * 
 * Main calendar comparison view that shows availability across group members.
 * This component integrates with the backend availability API to display
 * common free time slots and allow meeting scheduling.
 * 
 * Features:
 * - Visual calendar grid showing multiple weeks
 * - Color-coded availability indicators
 * - Member filtering and selection
 * - Meeting time suggestions
 * - Interactive time slot selection
 */
const GroupCalendar = ({ groupId, onBack }) => {
    // State management for calendar data and UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    
    // Calendar view settings
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        return nextWeek.toISOString().split('T')[0];
    });
    const [minDuration, setMinDuration] = useState(30);
    const [meetingDuration, setMeetingDuration] = useState(60);
    
    // UI state
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

    /**
     * Load group availability data from the backend API
     */
    const loadAvailability = async () => {
        if (!groupId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Build query parameters
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                min_duration: minDuration.toString()
            });
            
            // Add member filter if specific members are selected
            if (selectedMembers.length > 0) {
                params.append('members', selectedMembers.join(','));
            }
            
            // Fetch availability data
            const response = await fetch(
                `/api/availability/groups/${groupId}?${params}`, 
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load availability');
            }
            
            if (data.success) {
                setAvailabilityData(data);
                setGroupData({
                    id: data.group_id,
                    name: data.group_name,
                    members: data.members_analyzed
                });
            } else {
                throw new Error(data.error || 'Failed to load availability');
            }
            
        } catch (err) {
            console.error('Error loading availability:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get meeting time suggestions from the backend
     */
    const loadSuggestions = async () => {
        if (!groupId) return;
        
        setLoading(true);
        
        try {
            const response = await fetch(
                `/api/availability/groups/${groupId}/suggest`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        start_date: `${startDate}T00:00:00Z`,
                        end_date: `${endDate}T23:59:59Z`,
                        meeting_duration_minutes: meetingDuration,
                        max_suggestions: 10
                    })
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get suggestions');
            }
            
            if (data.success) {
                setSuggestions(data.suggestions || []);
                setShowSuggestions(true);
            } else {
                throw new Error(data.error || 'Failed to get suggestions');
            }
            
        } catch (err) {
            console.error('Error loading suggestions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load data when component mounts or settings change
    useEffect(() => {
        loadAvailability();
    }, [groupId, startDate, endDate, minDuration, selectedMembers]);

    /**
     * Handle member selection changes
     */
    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    /**
     * Format date for display
     */
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    /**
     * Format time for display
     */
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    /**
     * Get quality score color for suggestions
     */
    const getQualityColor = (score) => {
        if (score >= 0.8) return '#4CAF50'; // Green
        if (score >= 0.6) return '#FF9800'; // Orange
        return '#F44336'; // Red
    };

    /**
     * Handle time slot selection for meeting creation
     */
    const handleTimeSlotSelect = (slot) => {
        setSelectedTimeSlot(slot);
        // Here you could open a meeting creation modal
        console.log('Selected time slot:', slot);
    };

    if (loading && !availabilityData) {
        return (
            <div className="group-calendar loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading calendar data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="group-calendar error">
                <div className="error-message">
                    <h3>Error Loading Calendar</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadAvailability} className="retry-button">
                            Retry
                        </button>
                        <button onClick={onBack} className="back-button">
                            Back to Group
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group-calendar">
            {/* Header */}
            <div className="calendar-header">
                <div className="header-top">
                    <button onClick={onBack} className="back-button">
                        ← Back to Group
                    </button>
                    <h2>{groupData?.name || 'Group'} Calendar</h2>
                </div>
                
                {/* Controls */}
                <div className="calendar-controls">
                    <div className="date-controls">
                        <div className="control-group">
                            <label>Start Date:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="control-group">
                            <label>End Date:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="control-group">
                            <label>Min Duration:</label>
                            <select
                                value={minDuration}
                                onChange={(e) => setMinDuration(parseInt(e.target.value))}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="action-controls">
                        <button 
                            onClick={loadSuggestions} 
                            className="suggest-button"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Get Meeting Suggestions'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Filter */}
            {groupData?.members && (
                <div className="member-filter">
                    <h4>Filter by Members:</h4>
                    <div className="member-checkboxes">
                        {groupData.members.map(member => (
                            <label key={member.id} className="member-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(member.id)}
                                    onChange={() => handleMemberToggle(member.id)}
                                />
                                <span className="member-name">{member.name}</span>
                                <span className="member-events">({member.events_count} events)</span>
                            </label>
                        ))}
                        {selectedMembers.length > 0 && (
                            <button 
                                onClick={() => setSelectedMembers([])}
                                className="clear-filter"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="calendar-content">
                {/* Availability Display */}
                {availabilityData && (
                    <div className="availability-section">
                        <div className="availability-summary">
                            <h3>Common Availability</h3>
                            <div className="summary-stats">
                                <div className="stat">
                                    <span className="stat-number">{availabilityData.total_slots_found}</span>
                                    <span className="stat-label">Time Slots</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{Math.round(availabilityData.total_available_hours * 10) / 10}</span>
                                    <span className="stat-label">Total Hours</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{availabilityData.members_analyzed.length}</span>
                                    <span className="stat-label">Members</span>
                                </div>
                            </div>
                        </div>

                        {/* Available Time Slots */}
                        <div className="time-slots">
                            <h4>Available Time Slots</h4>
                            {availabilityData.common_availability.length === 0 ? (
                                <div className="no-availability">
                                    <p>No common availability found for the selected criteria.</p>
                                    <p>Try:</p>
                                    <ul>
                                        <li>Reducing the minimum duration</li>
                                        <li>Expanding the date range</li>
                                        <li>Selecting fewer members</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="slots-grid">
                                    {availabilityData.common_availability.map((slot, index) => (
                                        <div 
                                            key={index} 
                                            className="time-slot"
                                            onClick={() => handleTimeSlotSelect(slot)}
                                        >
                                            <div className="slot-date">
                                                {formatDate(slot.start_time)}
                                            </div>
                                            <div className="slot-time">
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </div>
                                            <div className="slot-duration">
                                                {slot.duration_minutes} minutes
                                            </div>
                                            <div className="slot-members">
                                                {slot.user_count} members available
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Meeting Suggestions */}
                {showSuggestions && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <h3>Meeting Suggestions</h3>
                            <div className="meeting-duration-control">
                                <label>Meeting Duration:</label>
                                <select
                                    value={meetingDuration}
                                    onChange={(e) => setMeetingDuration(parseInt(e.target.value))}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                    <option value={180}>3 hours</option>
                                </select>
                                <button onClick={loadSuggestions} className="update-suggestions">
                                    Update
                                </button>
                            </div>
                        </div>

                        {suggestions.length === 0 ? (
                            <div className="no-suggestions">
                                <p>No meeting suggestions found for {meetingDuration} minute meetings.</p>
                                <p>Try reducing the meeting duration or expanding the date range.</p>
                            </div>
                        ) : (
                            <div className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <div key={index} className="suggestion-card">
                                        <div className="suggestion-rank">#{suggestion.rank}</div>
                                        <div className="suggestion-details">
                                            <div className="suggestion-time">
                                                <strong>{formatDate(suggestion.start_time)}</strong>
                                                <span>{formatTime(suggestion.start_time)} - {formatTime(suggestion.end_time)}</span>
                                            </div>
                                            <div className="suggestion-meta">
                                                <span className="time-of-day">{suggestion.time_of_day}</span>
                                                <span className="day-of-week">{suggestion.day_of_week}</span>
                                            </div>
                                            <div className="suggestion-quality">
                                                <span>Quality Score:</span>
                                                <div 
                                                    className="quality-bar"
                                                    style={{ backgroundColor: getQualityColor(suggestion.quality_score) }}
                                                >
                                                    {Math.round(suggestion.quality_score * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="suggestion-actions">
                                            <button 
                                                onClick={() => handleTimeSlotSelect(suggestion)}
                                                className="schedule-button"
                                            >
                                                Schedule Meeting
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupCalendar;
