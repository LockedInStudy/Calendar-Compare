// filepath: frontend/src/pages/GroupDashboard.jsx
/**
 * GroupDashboard component displays detailed information about a specific group.
 * 
 * This component shows:
 * - Group information (name, description, join code)
 * - List of group members with their roles
 * - Group management options (for owners/admins)
 * - Calendar comparison features
 * 
 * Key React concepts:
 * - useParams for getting URL parameters
 * - useEffect for data fetching on component mount
 * - Conditional rendering based on user permissions
 * - State management for complex data structures
 */

import React, { useState, useEffect } from 'react';
// Import our group styling
import '../styles/Groups.css';

// GroupDashboard component - displays detailed information about a specific group
function GroupDashboard({ groupId, onBackToDashboard }) {
    
    // Component state
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('member');
      // UI state for various actions
    const [showJoinCode, setShowJoinCode] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);

    /**
     * Fetch group details when component mounts or groupId changes
     */
    useEffect(() => {
        if (groupId) {
            fetchGroupDetails();
        }
    }, [groupId]);

    /**
     * Fetch detailed group information from the backend
     */
    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`http://localhost:5000/groups/${groupId}`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setGroup(data.group);
                setUserRole(data.user_role || 'member');
            } else {
                setError(data.error || 'Failed to load group details');
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Copy join code to clipboard
     */
    const copyJoinCode = async () => {
        try {
            await navigator.clipboard.writeText(group.join_code);
            alert('Join code copied to clipboard!');
        } catch (error) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = group.join_code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Join code copied to clipboard!');
        }
    };    /**
     * Handle leaving the group
     */
    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/groups/${groupId}/leave`, {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                if (onBackToDashboard) {
                    onBackToDashboard();
                }
            } else {
                alert(data.error || 'Failed to leave group');
            }
        } catch (error) {
            console.error('Error leaving group:', error);
            alert('Network error. Please try again.');
        }
    };

    /**
     * Remove a member from the group (admin only)
     */    const removeMember = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to remove ${userName} from the group?`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/groups/${groupId}/members/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                fetchGroupDetails(); // Refresh group data
            } else {
                alert(data.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Network error. Please try again.');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="group-container">
                <div className="loading-container">
                    <div>🔄 Loading group details...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="group-container">
                <div className="error-message">
                    <strong>Error:</strong> {error}
                </div>
                <button 
                    onClick={onBackToDashboard} 
                    className="btn-secondary"
                    style={{ marginTop: '20px' }}
                >
                    ← Back to Dashboard                </button>
            </div>
        );
    }

    // No group found
    if (!group) {
        return (
            <div className="group-container">
                <div className="error-message">
                    <strong>Error:</strong> Group not found
                </div>
                <button 
                    onClick={onBackToDashboard} 
                    className="btn-secondary"
                    style={{ marginTop: '20px' }}
                >
                    ← Back to Dashboard
                </button>
            </div>        );
    }    /**
     * Check if current user has admin privileges
     */
    const isAdmin = () => {
        return userRole === 'owner' || userRole === 'admin';
    };

    return (
        <div className="group-container">
            {/* Group Header */}
            <div className="group-dashboard-header">
                <div className="group-info">
                    <h1 className="group-name">{group.name}</h1>
                    {group.description && (
                        <p className="group-description">{group.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        <span>👥 {group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                        <span>📅 Created {new Date(group.created_at).toLocaleDateString()}</span>
                        <span>🏷️ Your role: {userRole}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={() => setShowJoinCode(!showJoinCode)}
                        className="btn-secondary"
                    >
                        {showJoinCode ? 'Hide' : 'Show'} Join Code
                    </button>
                    
                    {showJoinCode && (
                        <div className="group-code-display">
                            <span>Join Code: </span>
                            <span className="group-code">{group.join_code}</span>
                            <button onClick={copyJoinCode} className="btn-secondary" style={{ marginLeft: '10px' }}>
                                📋 Copy
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Members Section */}
            <div style={{ marginTop: '30px' }}>
                <h2>👥 Group Members</h2>
                {group.members && group.members.length > 0 ? (
                    <div className="member-list">
                        {group.members.map((membership) => (
                            <div key={membership.user_id} className="member-item">
                                <div className="member-info">
                                    <div className="member-email">{membership.user.name}</div>
                                    <div className="member-role">{membership.user.email} • {membership.role}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Joined {new Date(membership.joined_at).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div className="member-actions">
                                    {isAdmin() && 
                                     membership.role !== 'owner' && 
                                     membership.user_id !== group.created_by_id && (
                                        <button
                                            onClick={() => removeMember(membership.user_id, membership.user.name)}
                                            className="btn-danger"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No members found
                    </div>
                )}
            </div>

            {/* Calendar Comparison Section */}
            <div style={{ marginTop: '30px' }}>
                <h2>📅 Calendar Comparison</h2>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center'
                }}>
                    <p>🚧 Calendar comparison features coming in Sprint 3!</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Soon you'll be able to compare calendars and find mutual free time.
                    </p>
                </div>
            </div>

            {/* Group Management Section */}
            <div style={{ marginTop: '30px' }}>
                <h2>⚙️ Group Management</h2>
                
                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Leave Group</h3>
                    <p>Remove yourself from this group.</p>
                    {!confirmLeave ? (
                        <button
                            onClick={() => setConfirmLeave(true)}
                            className="btn-danger"
                        >
                            Leave Group
                        </button>
                    ) : (
                        <div>
                            <p><strong>Are you sure you want to leave this group?</strong></p>
                            {userRole === 'owner' && (
                                <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                    ⚠️ As the owner, leaving will delete the entire group if you're the last member!
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button
                                    onClick={handleLeaveGroup}
                                    className="btn-danger"
                                >
                                    Yes, Leave Group
                                </button>
                                <button
                                    onClick={() => setConfirmLeave(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                    onClick={onBackToDashboard}
                    className="btn-secondary"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default GroupDashboard;
