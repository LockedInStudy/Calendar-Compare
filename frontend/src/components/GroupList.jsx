// filepath: frontend/src/components/GroupList.jsx
/**
 * GroupList component displays a list of groups that the user belongs to.
 * 
 * This component provides:
 * - Grid layout of group cards
 * - Quick actions for each group
 * - Loading and empty states
 * - Navigation to group details
 * 
 * Key React concepts:
 * - Props for receiving data from parent components
 * - Map function for rendering lists
 * - Event handling for user interactions
 * - Conditional rendering for different states
 */

import React from 'react';
// Import our group styling
import '../styles/Groups.css';

// GroupList component - displays a list of groups that the user belongs to
function GroupList({ groups, onViewGroup }) {

    /**
     * Format date for display
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };// Empty state
    if (!groups || groups.length === 0) {
        return (
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
        );
    }

    // Main group list rendering
    return (
        <div className="group-list">
            {groups.map((group) => (
                <div
                    key={group.id}
                    className="group-item"
                    onClick={() => onViewGroup(group.id)}
                    style={{ cursor: 'pointer' }}
                >
                    {/* Group Header */}
                    <div className="group-header">
                        <h3 className="group-title">{group.name}</h3>
                        <span className={`group-role ${group.user_role}`}>
                            {group.user_role}
                        </span>
                    </div>

                    {/* Group Description */}
                    {group.description && (
                        <p className="group-description">{group.description}</p>
                    )}

                    {/* Group Stats */}
                    <div className="group-stats">
                        <span>👥 {group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                        <span>📅 Created {formatDate(group.created_at)}</span>
                    </div>

                    {/* Group Actions */}
                    <div className="group-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent group click
                                onViewGroup(group.id);
                            }}
                            className="btn-primary"
                        >
                            View Details
                        </button>                    </div>
                </div>
            ))}
        </div>
    );
}

// Export the component so other files can import and use it
export default GroupList;
