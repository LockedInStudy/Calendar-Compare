// filepath: frontend/src/components/MemberList.jsx
/**
 * MemberList component displays members of a group with management options.
 * 
 * This component provides:
 * - List of group members with their information
 * - Role indicators and management actions
 * - Profile pictures and member details
 * - Admin controls for member management
 * 
 * Key React concepts:
 * - Props for configuration and data
 * - Conditional rendering based on permissions
 * - Event handling for member management
 * - Component composition and reusability
 */

import React, { useState } from 'react';
// Import our group styling
import '../styles/Groups.css';

const MemberList = ({ 
    members, 
    currentUserRole, 
    currentUserId, 
    groupId, 
    onMemberRemoved, 
    onError 
}) => {
    const [removingMember, setRemovingMember] = useState(null);

    /**
     * Handle removing a member from the group
     * 
     * @param {number} userId - ID of the user to remove
     * @param {string} userName - Name of the user (for confirmation)
     */
    const handleRemoveMember = async (userId, userName) => {
        // Confirm removal
        if (!window.confirm(`Are you sure you want to remove ${userName} from the group?`)) {
            return;
        }

        setRemovingMember(userId);

        try {
            const response = await fetch(`http://localhost:5000/groups/${groupId}/members/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Call parent callback to refresh member list
                if (onMemberRemoved) {
                    onMemberRemoved(userId, data.message);
                }
            } else {
                if (onError) {
                    onError(data.error || 'Failed to remove member');
                }
            }
        } catch (error) {
            console.error('Error removing member:', error);
            if (onError) {
                onError('Network error. Please try again.');
            }
        } finally {
            setRemovingMember(null);
        }
    };

    /**
     * Check if current user can manage a specific member
     * 
     * @param {object} member - Member object to check
     * @returns {boolean} Whether current user can remove this member
     */
    const canManageMember = (member) => {
        // Must be admin or owner to manage members
        if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
            return false;
        }
        
        // Cannot remove yourself
        if (member.user_id === currentUserId) {
            return false;
        }
        
        // Cannot remove the owner
        if (member.role === 'owner') {
            return false;
        }
        
        return true;
    };

    /**
     * Get role display styling
     * 
     * @param {string} role - Member role
     * @returns {string} CSS class for role styling
     */
    const getRoleClass = (role) => {
        switch (role) {
            case 'owner':
                return 'member-role role-owner';
            case 'admin':
                return 'member-role role-admin';
            default:
                return 'member-role role-member';
        }
    };

    /**
     * Format join date
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    const formatJoinDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Joined today';
        } else if (diffDays <= 7) {
            return `Joined ${diffDays} days ago`;
        } else {
            return `Joined ${date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}`;
        }
    };

    if (!members || members.length === 0) {
        return (
            <div className="member-list-empty">
                <p>No members found.</p>
            </div>
        );
    }

    return (
        <div className="member-list-container">
            <div className="member-list-header">
                <h3>
                    Members ({members.length})
                </h3>
            </div>

            <div className="member-list">
                {members.map((membership) => (
                    <div 
                        key={membership.user_id} 
                        className={`member-item ${membership.user_id === currentUserId ? 'current-user' : ''}`}
                    >
                        {/* Member Avatar and Basic Info */}
                        <div className="member-primary-info">
                            <div className="member-avatar-container">
                                {membership.user.profile_picture ? (
                                    <img
                                        src={membership.user.profile_picture}
                                        alt={membership.user.name}
                                        className="member-avatar"
                                        onError={(e) => {
                                            // Fallback to initials if image fails to load
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div 
                                    className="member-avatar-fallback"
                                    style={{ 
                                        display: membership.user.profile_picture ? 'none' : 'flex' 
                                    }}
                                >
                                    {membership.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                            </div>

                            <div className="member-details">
                                <div className="member-name-container">
                                    <span className="member-name">
                                        {membership.user.name}
                                    </span>
                                    {membership.user_id === currentUserId && (
                                        <span className="current-user-badge">(You)</span>
                                    )}
                                </div>
                                <span className="member-email">
                                    {membership.user.email}
                                </span>
                                <span className="member-join-date">
                                    {formatJoinDate(membership.joined_at)}
                                </span>
                            </div>
                        </div>

                        {/* Member Role and Status */}
                        <div className="member-secondary-info">
                            <div className="member-role-container">
                                <span className={getRoleClass(membership.role)}>
                                    {membership.role}
                                </span>
                                
                                {membership.is_active ? (
                                    <span className="member-status active">Active</span>
                                ) : (
                                    <span className="member-status inactive">Inactive</span>
                                )}
                            </div>

                            {/* Notification Settings */}
                            <div className="member-notifications">
                                <span className={`notification-status ${membership.email_notifications ? 'enabled' : 'disabled'}`}>
                                    {membership.email_notifications ? '🔔' : '🔕'} Notifications
                                </span>
                            </div>
                        </div>

                        {/* Management Actions */}
                        <div className="member-actions">
                            {canManageMember(membership) && (
                                <button
                                    onClick={() => handleRemoveMember(membership.user_id, membership.user.name)}
                                    disabled={removingMember === membership.user_id}
                                    className="btn-danger btn-small"
                                    title={`Remove ${membership.user.name} from group`}
                                >
                                    {removingMember === membership.user_id ? 'Removing...' : 'Remove'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Member List Footer */}
            <div className="member-list-footer">
                <div className="member-stats">
                    <span>
                        {members.filter(m => m.role === 'owner').length} owner,{' '}
                        {members.filter(m => m.role === 'admin').length} admin{members.filter(m => m.role === 'admin').length !== 1 ? 's' : ''},{' '}
                        {members.filter(m => m.role === 'member').length} member{members.filter(m => m.role === 'member').length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MemberList;
