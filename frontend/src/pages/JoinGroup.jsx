// filepath: frontend/src/pages/JoinGroup.jsx
/**
 * JoinGroup component allows users to join existing groups using a join code.
 * 
 * This component provides:
 * - Input field for entering join codes
 * - Validation and error handling
 * - Success feedback and navigation
 * 
 * Key React concepts:
 * - Controlled components for form inputs
 * - API integration for joining groups
 * - Error state management
 * - Navigation after successful operations
 */

import React, { useState } from 'react';
// Import our group styling
import '../styles/Groups.css';

// JoinGroup component - allows users to join existing groups using join codes
function JoinGroup({ onGroupJoined }) {
    
    // Component state
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /**
     * Handle join code input changes
     * Automatically formats the join code to uppercase
     * 
     * @param {Event} e - Input change event
     */
    const handleJoinCodeChange = (e) => {
        // Convert to uppercase and limit to 8 characters
        const value = e.target.value.toUpperCase().slice(0, 8);
        setJoinCode(value);
        
        // Clear error when user starts typing
        if (error) setError('');
    };

    /**
     * Handle form submission to join a group
     * 
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate join code
        if (!joinCode.trim()) {
            setError('Please enter a join code');
            return;
        }
        
        if (joinCode.length !== 8) {
            setError('Join code must be 8 characters long');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Send request to join group
            const response = await fetch('http://localhost:5000/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    join_code: joinCode.trim()
                })
            });
            
            const data = await response.json();
              if (data.success) {
                setSuccess(`Successfully joined "${data.group.name}"!`);
                
                // Call the callback to return to dashboard after 1.5 seconds
                setTimeout(() => {
                    if (onGroupJoined) {
                        onGroupJoined();
                    }
                }, 1500);
            } else {
                setError(data.error || 'Failed to join group');
            }
        } catch (error) {
            console.error('Error joining group:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };    return (
        <div className="group-container">
            <form onSubmit={handleSubmit} className="group-form">
                <h2>🔗 Join a Group</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Enter the 8-character join code shared by the group owner.
                </p>
                
                {/* Error message display */}
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {/* Success message display */}
                {success && (
                    <div className="success-message">
                        <strong>Success!</strong> {success}
                    </div>
                )}
                
                {/* Join code input */}
                <div className="form-group">
                    <label htmlFor="joinCode">
                        Join Code *
                    </label>
                    <input
                        type="text"
                        id="joinCode"
                        value={joinCode}
                        onChange={handleJoinCodeChange}
                        placeholder="ABC123XY"
                        required
                        disabled={loading}
                        style={{
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            textAlign: 'center',
                            fontSize: '18px',
                            fontFamily: 'monospace'
                        }}
                    />
                    <small>
                        Join codes are 8 characters long and contain letters and numbers
                    </small>
                </div>
                
                {/* Submit button */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !joinCode.trim() || joinCode.length !== 8}
                >
                    {loading ? '🔄 Joining Group...' : '🔗 Join Group'}
                </button>
            </form>
            
            {/* Help section */}
            <div style={{ 
                maxWidth: '500px', 
                margin: '30px auto 0', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>💡 Need help?</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Ask the group owner for the join code</li>
                    <li>Join codes are case-insensitive</li>
                    <li>Make sure you're logged in with your Google account</li>
                    <li>Each join code can only be used once per user</li>
                </ul>
            </div>
        </div>    );
};

export default JoinGroup;