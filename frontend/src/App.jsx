// This is the main App component for our Calendar Compare application
// It serves as the root component that contains all other components and handles navigation

// Import React hooks and styling
import { useState } from 'react'
import './App.css'

// Import our custom components
import PingTest from './components/PingTest'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import CreateGroup from './pages/CreateGroup'
import JoinGroup from './pages/JoinGroup'
import GroupDashboard from './pages/GroupDashboard'

// Main App component - this is the top-level component of our application
function App() {
  // State to track which page/view to show
  // 'home' = main page with ping test
  // 'login' = Google authentication page
  // 'dashboard' = calendar events page (after login)
  // 'create-group' = create new group page
  // 'join-group' = join existing group page
  // 'group-dashboard' = specific group management page
  const [currentView, setCurrentView] = useState('home');
  
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State to track selected group ID for group dashboard
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard'); // Automatically go to dashboard after login
  };

  // Function to navigate to specific group dashboard
  const handleViewGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentView('group-dashboard');
  };

  // Function to render the navigation menu
  const renderNavigation = () => (
    <nav style={{
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #ddd',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo/Title */}
        <h3 style={{ margin: '0', color: '#333' }}>📅 Calendar Compare</h3>
        
        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'home' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🏠 Home
          </button>
          
          <button
            onClick={() => setCurrentView('login')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'login' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔐 Login
          </button>
          
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'dashboard' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📊 Dashboard
          </button>
          
          {/* Group management buttons - only show if logged in */}
          {isLoggedIn && (
            <>
              <button
                onClick={() => setCurrentView('create-group')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentView === 'create-group' ? '#007bff' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                👥 Create Group
              </button>
              
              <button
                onClick={() => setCurrentView('join-group')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentView === 'join-group' ? '#007bff' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔗 Join Group
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  // Function to render the current page based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      
      case 'dashboard':
        return <Dashboard onViewGroup={handleViewGroup} />;
      
      case 'create-group':
        return <CreateGroup onGroupCreated={() => setCurrentView('dashboard')} />;
      
      case 'join-group':
        return <JoinGroup onGroupJoined={() => setCurrentView('dashboard')} />;
      
      case 'group-dashboard':
        return (
          <GroupDashboard 
            groupId={selectedGroupId} 
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        );
      
      case 'home':
      default:
        return (
          <div>
            {/* Home page content */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h1>📅 Calendar Compare</h1>
              <p>A web application to help teams find common availability by syncing Google Calendars</p>
              <p><strong>Sprint 0 & 1 Implementation</strong></p>
            </div>

            {/* Backend connectivity test */}
            <div style={{ padding: '20px' }}>
              <PingTest />
            </div>

            {/* Feature overview */}
            <div style={{ 
              maxWidth: '800px', 
              margin: '0 auto', 
              padding: '20px' 
            }}>
              <h3>🌟 Implemented Features</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                {/* Sprint 0 features */}
                <div style={{
                  padding: '15px',
                  border: '1px solid #28a745',
                  borderRadius: '8px',
                  backgroundColor: '#e8f5e8'
                }}>
                  <h4>✅ Sprint 0 - Project Bootstrap</h4>
                  <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                    <li>Flask backend with CORS support</li>
                    <li>React frontend with Vite</li>
                    <li>Backend-frontend communication</li>
                    <li>/ping route for connectivity testing</li>
                  </ul>
                </div>

                {/* Sprint 1 features */}
                <div style={{
                  padding: '15px',
                  border: '1px solid #28a745',
                  borderRadius: '8px',
                  backgroundColor: '#e8f5e8'
                }}>
                  <h4>✅ Sprint 1 - Google Integration</h4>
                  <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                    <li>Google OAuth2 authentication</li>
                    <li>Calendar events fetching</li>
                    <li>User dashboard with event display</li>
                    <li>Session management</li>
                  </ul>
                </div>

                {/* Sprint 2 features */}
                <div style={{
                  padding: '15px',
                  border: '1px solid #28a745',
                  borderRadius: '8px',
                  backgroundColor: '#e8f5e8'
                }}>
                  <h4>✅ Sprint 2 - Group Management</h4>
                  <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                    <li>Create and join groups</li>
                    <li>Group invitation codes</li>
                    <li>Member management system</li>
                    <li>Role-based permissions</li>
                  </ul>
                </div>
              </div>

              {/* Quick start instructions */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <h4>🚀 Quick Start</h4>
                <ol style={{ textAlign: 'left', lineHeight: '1.6' }}>
                  <li><strong>Test Backend:</strong> Click "Test Backend" above to verify connectivity</li>
                  <li><strong>Setup Google OAuth:</strong> Add your Google credentials to .env file</li>
                  <li><strong>Login:</strong> Go to Login page and authenticate with Google</li>
                  <li><strong>View Events:</strong> Check Dashboard to see your calendar events</li>
                  <li><strong>Create Groups:</strong> Use "Create Group" to start a new team</li>
                  <li><strong>Join Groups:</strong> Use "Join Group" with an invitation code</li>
                </ol>
              </div>
            </div>
          </div>
        );
    }
  };

  // This is the main render function - it returns JSX that describes our UI
  return (
    <>
      {/* Navigation bar */}
      {renderNavigation()}

      {/* Main content area */}
      <div style={{ minHeight: 'calc(100vh - 200px)' }}>
        {renderCurrentView()}
      </div>

      {/* Footer with development info */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        borderTop: '1px solid #eee',
        marginTop: '40px',
        color: '#666',
        backgroundColor: '#f8f9fa'
      }}>
        <p>Built with React + Vite (Frontend) and Flask (Backend)</p>
        <p><small>Sprint 0, 1 & 2 Complete - Group Management System Ready</small></p>
      </div>
    </>
  )
}

// Export the App component so it can be used in main.jsx
export default App
