import React, { useState } from 'react';

/**
 * ScheduleMeeting Component
 * 
 * Interface for creating and scheduling meetings based on available time slots.
 * Integrates with Google Calendar to create actual calendar events.
 * 
 * Features:
 * - Meeting details form (title, description, duration)
 * - Time slot selection integration
 * - Attendee management
 * - Google Calendar event creation
 * - Meeting confirmation and sharing
 */
const ScheduleMeeting = ({ 
    groupId, 
    selectedTimeSlot, 
    groupMembers, 
    onCancel, 
    onMeetingCreated 
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Meeting form state
    const [meetingData, setMeetingData] = useState({
        title: '',
        description: '',
        duration: 60,
        attendees: groupMembers?.map(m => m.id) || [],
        location: '',
        isOnline: false,
        meetingLink: '',
        sendNotifications: true
    });

    /**
     * Handle form input changes
     */
    const handleInputChange = (field, value) => {
        setMeetingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Toggle attendee selection
     */
    const toggleAttendee = (memberId) => {
        setMeetingData(prev => ({
            ...prev,
            attendees: prev.attendees.includes(memberId)
                ? prev.attendees.filter(id => id !== memberId)
                : [...prev.attendees, memberId]
        }));
    };

    /**
     * Validate meeting form
     */
    const validateForm = () => {
        if (!meetingData.title.trim()) {
            throw new Error('Meeting title is required');
        }
        if (meetingData.attendees.length === 0) {
            throw new Error('At least one attendee must be selected');
        }
        if (meetingData.duration < 15 || meetingData.duration > 480) {
            throw new Error('Duration must be between 15 minutes and 8 hours');
        }
    };

    /**
     * Format time for display
     */
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    /**
     * Calculate meeting end time
     */
    const getMeetingEndTime = () => {
        if (!selectedTimeSlot?.start_time) return null;
        
        const startTime = new Date(selectedTimeSlot.start_time);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + meetingData.duration);
        return endTime;
    };

    /**
     * Create the meeting
     */
    const handleCreateMeeting = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Validate form
            validateForm();
            
            const endTime = getMeetingEndTime();
            if (!endTime) {
                throw new Error('Invalid time slot selected');
            }

            // Prepare meeting data for API
            const meetingPayload = {
                title: meetingData.title.trim(),
                description: meetingData.description.trim(),
                start_time: selectedTimeSlot.start_time,
                end_time: endTime.toISOString(),
                attendee_ids: meetingData.attendees,
                location: meetingData.location.trim(),
                is_online: meetingData.isOnline,
                meeting_link: meetingData.meetingLink.trim(),
                send_notifications: meetingData.sendNotifications
            };

            // Create meeting via API
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(meetingPayload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create meeting');
            }

            if (data.success) {
                setSuccess(true);
                if (onMeetingCreated) {
                    onMeetingCreated(data.meeting);
                }
            } else {
                throw new Error(data.error || 'Failed to create meeting');
            }

        } catch (err) {
            console.error('Error creating meeting:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate meeting link (placeholder for integration with meeting platforms)
     */
    const generateMeetingLink = () => {
        // In a real app, this would integrate with Zoom, Teams, etc.
        const meetingId = Math.random().toString(36).substr(2, 9);
        const link = `https://meet.example.com/${meetingId}`;
        handleInputChange('meetingLink', link);
    };

    if (!selectedTimeSlot) {
        return (
            <div className="schedule-meeting error">
                <h3>No Time Slot Selected</h3>
                <p>Please select an available time slot first.</p>
                <button onClick={onCancel} className="cancel-button">
                    Back
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="schedule-meeting success">
                <div className="success-content">
                    <h3>✅ Meeting Scheduled Successfully!</h3>
                    <div className="meeting-summary">
                        <h4>{meetingData.title}</h4>
                        <p>
                            <strong>When:</strong> {formatDateTime(selectedTimeSlot.start_time).date}<br/>
                            <strong>Time:</strong> {formatDateTime(selectedTimeSlot.start_time).time} - {formatDateTime(getMeetingEndTime().toISOString()).time}
                        </p>
                        <p><strong>Attendees:</strong> {meetingData.attendees.length} people</p>
                        {meetingData.location && (
                            <p><strong>Location:</strong> {meetingData.location}</p>
                        )}
                        {meetingData.meetingLink && (
                            <p><strong>Meeting Link:</strong> <a href={meetingData.meetingLink} target="_blank" rel="noopener noreferrer">{meetingData.meetingLink}</a></p>
                        )}
                    </div>
                    <div className="success-actions">
                        <button onClick={onCancel} className="done-button">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedDateTime = formatDateTime(selectedTimeSlot.start_time);
    const endDateTime = getMeetingEndTime();

    return (
        <div className="schedule-meeting">
            <div className="meeting-header">
                <h3>Schedule New Meeting</h3>
                <button onClick={onCancel} className="close-button">×</button>
            </div>

            {error && (
                <div className="error-message">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="meeting-form">
                {/* Selected Time Display */}
                <div className="selected-time">
                    <h4>Selected Time Slot</h4>
                    <div className="time-display">
                        <div className="date">{selectedDateTime.date}</div>
                        <div className="time">
                            {selectedDateTime.time} - {endDateTime ? formatDateTime(endDateTime.toISOString()).time : ''}
                        </div>
                        <div className="duration">Duration: {meetingData.duration} minutes</div>
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="meeting-details">
                    <div className="form-group">
                        <label htmlFor="title">Meeting Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={meetingData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter meeting title"
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={meetingData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Meeting agenda or description (optional)"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration">Duration (minutes)</label>
                            <select
                                id="duration"
                                value={meetingData.duration}
                                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                                <option value={180}>3 hours</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={meetingData.isOnline}
                                    onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                                />
                                Online Meeting
                            </label>
                        </div>
                    </div>

                    {/* Location or Meeting Link */}
                    <div className="form-group">
                        <label htmlFor="location">
                            {meetingData.isOnline ? 'Meeting Link' : 'Location'}
                        </label>
                        <div className="location-input">
                            <input
                                type={meetingData.isOnline ? 'url' : 'text'}
                                id="location"
                                value={meetingData.isOnline ? meetingData.meetingLink : meetingData.location}
                                onChange={(e) => handleInputChange(
                                    meetingData.isOnline ? 'meetingLink' : 'location', 
                                    e.target.value
                                )}
                                placeholder={meetingData.isOnline ? 'https://meet.example.com/...' : 'Conference room or address'}
                            />
                            {meetingData.isOnline && (
                                <button 
                                    type="button"
                                    onClick={generateMeetingLink}
                                    className="generate-link-button"
                                >
                                    Generate Link
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendees */}
                <div className="attendees-section">
                    <h4>Attendees</h4>
                    <div className="attendees-list">
                        {groupMembers?.map(member => (
                            <label key={member.id} className="attendee-item">
                                <input
                                    type="checkbox"
                                    checked={meetingData.attendees.includes(member.id)}
                                    onChange={() => toggleAttendee(member.id)}
                                />
                                <div className="member-info">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-email">{member.email}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="notifications-section">
                    <label className="notification-option">
                        <input
                            type="checkbox"
                            checked={meetingData.sendNotifications}
                            onChange={(e) => handleInputChange('sendNotifications', e.target.checked)}
                        />
                        Send calendar invitations to attendees
                    </label>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button 
                        onClick={onCancel} 
                        className="cancel-button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateMeeting} 
                        className="create-button"
                        disabled={loading || !meetingData.title.trim()}
                    >
                        {loading ? 'Creating...' : 'Create Meeting'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
