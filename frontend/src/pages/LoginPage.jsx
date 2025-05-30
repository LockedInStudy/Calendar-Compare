// Login Page Component
// This page handles user authentication with Google

// Import React and hooks for managing component state
import React, { useState, useEffect } from 'react';

// LoginPage component - handles Google OAuth login process
function LoginPage({ onLoginSuccess }) {
    // State variables to track login process
    // loginStatus: tracks current state of login (idle, logging_in, success, error)
    const [loginStatus, setLoginStatus] = useState('idle');
    
    // errorMessage: stores any error messages to show the user
    const [errorMessage, setErrorMessage] = useState('');
    
    // isLoggedIn: tracks if user is currently logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // useEffect hook runs when component first loads
    // This checks if the user is already logged in
    useEffect(() => {
        checkLoginStatus();
    }, []); // Empty dependency array means this runs only once when component mounts

    // Function to check if user is already logged in
    const checkLoginStatus = async () => {
        try {
            // Call our backend to check authentication status
            const response = await fetch('http://localhost:5000/auth/status', {
                credentials: 'include' // Include cookies/session data
            });
            
            if (response.ok) {
                // Parse the JSON response
                const data = await response.json();
                
                // Update state based on login status
                setIsLoggedIn(data.logged_in);
                
                // If user is logged in, notify parent component
                if (data.logged_in && onLoginSuccess) {
                    onLoginSuccess();
                }
            }
        } catch (error) {
            // If checking status fails, assume user is not logged in
            console.error('Error checking login status:', error);
            setIsLoggedIn(false);
        }
    };

    // Function to start the Google login process
    const handleLogin = async () => {
        try {
            // Set status to show we're logging in
            setLoginStatus('logging_in');
            setErrorMessage('');
            
            // Redirect to our backend's login route
            // This will redirect the user to Google's login page
            window.location.href = 'http://localhost:5000/auth/login';
            
        } catch (error) {
            // If something goes wrong, show error
            console.error('Error starting login:', error);
            setLoginStatus('error');
            setErrorMessage('Failed to start login process. Please try again.');
        }
    };

    // Function to log out the user
    const handleLogout = async () => {
        try {
            // Call our backend's logout route
            const response = await fetch('http://localhost:5000/auth/logout', {
                credentials: 'include' // Include cookies/session data
            });
            
            if (response.ok) {
                // Update state to reflect logout
                setIsLoggedIn(false);
                setLoginStatus('idle');
                setErrorMessage('');
                
                // Reload the page to reset everything
                window.location.reload();
            } else {
                throw new Error('Logout failed');
            }
            
        } catch (error) {
            console.error('Error during logout:', error);
            setErrorMessage('Failed to log out. Please try again.');
        }
    };

    // JSX - The user interface for this component
    return (
        <div style={{ 
            maxWidth: '400px', 
            margin: '0 auto', 
            padding: '20px',
            textAlign: 'center'
        }}>
            <h2>🔐 Authentication</h2>
            
            {/* Show different content based on login status */}
            
            {!isLoggedIn ? (
                // User is NOT logged in - show login options
                <div>
                    <p>Connect your Google Calendar to get started</p>
                    
                    {/* Login button */}
                    <button
                        onClick={handleLogin}
                        disabled={loginStatus === 'logging_in'}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            backgroundColor: loginStatus === 'logging_in' ? '#ccc' : '#4285f4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loginStatus === 'logging_in' ? 'not-allowed' : 'pointer',
                            marginBottom: '15px'
                        }}
                    >
                        {loginStatus === 'logging_in' ? 'Redirecting to Google...' : '🔗 Login with Google'}
                    </button>
                    
                    {/* Show error message if there is one */}
                    {errorMessage && (
                        <div style={{ 
                            color: 'red', 
                            marginTop: '10px',
                            padding: '10px',
                            border: '1px solid red',
                            borderRadius: '5px',
                            backgroundColor: '#ffebee'
                        }}>
                            {errorMessage}
                        </div>
                    )}
                    
                    {/* Instructions for setup */}
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '5px',
                        fontSize: '14px',
                        textAlign: 'left'
                    }}>
                        <strong>Setup Instructions:</strong>
                        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Create a Google Cloud Console project</li>
                            <li>Enable the Google Calendar API</li>
                            <li>Create OAuth 2.0 credentials</li>
                            <li>Add your credentials to the .env file</li>
                            <li>Restart the backend server</li>
                        </ol>
                    </div>
                </div>
            ) : (
                // User IS logged in - show logout option and success message
                <div>
                    <div style={{ 
                        color: 'green', 
                        marginBottom: '20px',
                        padding: '15px',
                        border: '1px solid green',
                        borderRadius: '5px',
                        backgroundColor: '#e8f5e8'
                    }}>
                        ✅ Successfully logged in with Google!
                        <br />
                        <small>You can now access your calendar events.</small>
                    </div>
                    
                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
}

// Export the component so other files can import and use it
export default LoginPage;
