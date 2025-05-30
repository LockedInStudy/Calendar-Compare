// This is a React component that tests if our backend server is working
// React is a JavaScript library for building user interfaces
// Components are reusable pieces of UI that can have their own state and logic

// Import React and the useState hook
// useState is a React hook that lets us add state (data that can change) to our component
import React, { useState } from 'react';

// Define our PingTest component
// Components in React are just functions that return JSX (HTML-like syntax)
function PingTest() {
    // useState hook creates a state variable and a function to update it
    // responseData: stores the response from our backend
    // setResponseData: function to update responseData
    // useState(null): sets the initial value to null (empty)
    const [responseData, setResponseData] = useState(null);
    
    // loading: tracks whether we're currently waiting for a response
    // setLoading: function to update the loading state
    // useState(false): initially we're not loading
    const [loading, setLoading] = useState(false);
    
    // error: stores any error messages if something goes wrong
    // setError: function to update the error state
    const [error, setError] = useState(null);

    // This function runs when the user clicks the "Test Backend" button
    // async means this function can wait for things to complete (like network requests)
    const testPing = async () => {
        // Set loading to true to show the user we're working
        setLoading(true);
        
        // Clear any previous errors
        setError(null);
        
        try {
            // fetch() is a JavaScript function that makes HTTP requests
            // We're requesting data from our Flask backend's /ping route
            // The backend should be running on localhost:5000
            const response = await fetch('http://localhost:5000/ping');
            
            // Check if the response is successful (status code 200-299)
            if (!response.ok) {
                // If not successful, throw an error with the status
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Convert the response to JSON format
            // This should contain our {"message": "pong", "status": "success"} data
            const data = await response.json();
            
            // Update our state with the received data
            setResponseData(data);
            
        } catch (err) {
            // If anything goes wrong (network error, server error, etc.)
            // Update the error state with the error message
            setError(err.message);
            console.error('Error testing ping:', err);
        } finally {
            // finally block runs whether the try succeeded or failed
            // Set loading back to false since we're done
            setLoading(false);
        }
    };

    // JSX: This looks like HTML but it's actually JavaScript
    // Everything between the return() parentheses is what gets displayed
    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            {/* This is a JSX comment */}
            <h2>Backend Connection Test</h2>
            <p>Click the button below to test if the Flask backend is running:</p>
            
            {/* Button that calls testPing when clicked */}
            {/* disabled={loading} means the button is disabled while loading */}
            <button 
                onClick={testPing} 
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {/* Conditional rendering: show different text based on loading state */}
                {loading ? 'Testing...' : 'Test Backend'}
            </button>

            {/* Show different content based on our state */}
            
            {/* If we're loading, show a loading message */}
            {loading && (
                <div style={{ marginTop: '20px', color: '#666' }}>
                    Connecting to backend...
                </div>
            )}
            
            {/* If we have an error, show it in red */}
            {error && (
                <div style={{ marginTop: '20px', color: 'red' }}>
                    <strong>Error:</strong> {error}
                    <br />
                    <small>Make sure the Flask backend is running on localhost:5000</small>
                </div>
            )}
            
            {/* If we have response data, show it in green */}
            {responseData && !loading && (
                <div style={{ marginTop: '20px', color: 'green' }}>
                    <strong>Success!</strong> Backend is responding:
                    {/* JSON.stringify converts JavaScript objects to readable text */}
                    <pre style={{ 
                        background: '#f4f4f4', 
                        padding: '10px', 
                        borderRadius: '5px',
                        marginTop: '10px'
                    }}>
                        {JSON.stringify(responseData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

// Export the component so other files can import and use it
export default PingTest;
