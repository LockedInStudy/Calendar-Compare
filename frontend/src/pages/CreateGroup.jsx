// filepath: frontend/src/pages/CreateGroup.jsx
/**
 * CreateGroup component allows users to create new calendar comparison groups.
 * 
 * This component provides a form for creating groups with:
 * - Group name (required)
 * - Description (optional)
 * - Automatic join code generation
 * 
 * Key React concepts demonstrated:
 * - useState for form state management
 * - Form submission handling
 * - API calls with fetch
 * - Loading states and error handling
 * - Conditional rendering
 */

import React, { useState } from 'react';
// Import our group styling
import '../styles/Groups.css';

// CreateGroup component - allows users to create new calendar comparison groups
function CreateGroup({ onGroupCreated }) {
    
    // Form state management using useState hook
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    // UI state management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /**
     * Handle form input changes
     * This function updates the form state whenever user types in input fields
     * 
     * @param {Event} e - The input change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,  // Spread operator keeps existing form data
            [name]: value  // Update only the changed field
        }));
        
        // Clear any previous error when user starts typing
        if (error) setError('');
    };

    /**
     * Handle form submission
     * This function sends the group creation request to the backend
     * 
     * @param {Event} e - The form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent default form submission behavior
        
        // Basic form validation
        if (!formData.name.trim()) {
            setError('Group name is required');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Send POST request to backend to create group
            const response = await fetch('http://localhost:5000/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Include session cookies
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim()
                })
            });
            
            const data = await response.json();
              if (data.success) {
                setSuccess(`Group "${data.group.name}" created successfully! Join code: ${data.group.join_code}`);
                
                // Clear form after successful creation
                setFormData({ name: '', description: '' });
                
                // Call the callback to return to dashboard after 2 seconds
                setTimeout(() => {
                    if (onGroupCreated) {
                        onGroupCreated();
                    }
                }, 2000);
            } else {
                setError(data.error || 'Failed to create group');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };    return (
        <div className="group-container">
            <form onSubmit={handleSubmit} className="group-form">
                <h2>👥 Create New Group</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Create a group to compare calendars with friends, family, or colleagues.
                </p>
                
                {/* Display error message if any */}
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {/* Display success message if any */}
                {success && (
                    <div className="success-message">
                        <strong>Success!</strong> {success}
                    </div>
                )}
                
                {/* Group name input */}
                <div className="form-group">
                    <label htmlFor="name">
                        Group Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter group name (e.g., 'Family Calendar', 'Project Team')"
                        required
                        disabled={loading}
                        maxLength={100}
                    />
                    <small>Choose a descriptive name for your group</small>
                </div>
                
                {/* Group description input */}
                <div className="form-group">
                    <label htmlFor="description">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the purpose of this group..."
                        disabled={loading}
                        maxLength={500}
                    />
                    <small>Help members understand what this group is for</small>
                </div>
                
                {/* Submit button */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !formData.name.trim()}
                >
                    {loading ? '🔄 Creating Group...' : '👥 Create Group'}
                </button>
            </form>
            
            {/* Information section */}
            <div style={{ 
                maxWidth: '500px', 
                margin: '30px auto 0', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 How it works:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>After creating your group, you'll get a unique join code</li>
                    <li>Share this code with people you want to add to the group</li>
                    <li>Group members can compare their calendars to find mutual free time</li>
                    <li>You can manage group settings and members as the group owner</li>
                </ul>
            </div>
        </div>
    );
};

// Export the component so other files can import and use it
export default CreateGroup;
