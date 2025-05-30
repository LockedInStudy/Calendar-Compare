# Calendar Compare 🗓️

**Calendar Compare** is a web application designed to help teams resolve scheduling conflicts by syncing Google Calendars and identifying common availability. Built with Flask (Python) and React, this project aims to streamline meeting coordination, especially for remote or distributed teams.

## 🌟 Current Features (Sprint 0 & 1 Complete)
- 🔁 **Google Calendar Integration** ✅ – Users can securely connect and sync their calendars via OAuth2
- 🔐 **Secure Authentication** ✅ – Complete Google OAuth2 login/logout flow with session management
- 📊 **Event Display** ✅ – View upcoming calendar events in a beautiful, responsive interface
- 🌐 **Cross-Platform Communication** ✅ – React frontend communicates seamlessly with Flask backend
- 🕓 **Event Processing** ✅ – Smart parsing of calendar events with duration, timezone, and status handling

## 🚧 Planned Features (Next Sprints)
- 🕓 **Smart Conflict Detection** – Automatically detect overlapping availability across multiple calendars
- 👥 **Group Management** – Create and join calendar comparison groups with unique codes
- 🌐 **Timezone Support** – Convert and align meeting times for users in different time zones
- 🔔 **Slack Notifications** – Send real-time Slack alerts when a mutually available time is found
- 📊 **Availability Visualization** – Display common free slots in an intuitive calendar view

## 🛠️ Tech Stack
- **Backend**: Python 3.11+, Flask, Google Calendar API, Google OAuth2
- **Frontend**: React 18, Vite, Modern JavaScript/JSX
- **Communication**: RESTful APIs with CORS, JSON data exchange
- **Authentication**: Google OAuth2 with server-side session management
- **Development**: Hot reloading, extensive error handling, comprehensive logging

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ and npm installed
- Google Cloud Console project with Calendar API enabled

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start Flask development server
python run.py
```
Backend will be available at: `http://localhost:5000`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

### 3. Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add `http://localhost:5000/auth/callback` to authorized redirect URIs
6. Create a `.env` file in the project root:
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## 🎯 Usage

1. **Test Connectivity**: Use the "Test Backend" button to verify the servers are communicating
2. **Authenticate**: Click "Login with Google" to authorize calendar access
3. **View Events**: Navigate to Dashboard to see your upcoming calendar events
4. **Explore**: All features include comprehensive error handling and user feedback

## 📁 Project Structure

```
calendar-compare/
├── backend/                 # Flask backend application
│   ├── app/
│   │   ├── __init__.py     # App factory with CORS and blueprint registration
│   │   ├── config.py       # Configuration and environment variables
│   │   ├── routes.py       # Main routes (/, /ping, /example)
│   │   ├── auth/           # Authentication module
│   │   │   ├── routes.py   # OAuth routes (/login, /callback, /logout, /status)
│   │   │   └── google.py   # Google OAuth2 handling class
│   │   └── calendars/      # Calendar operations module
│   │       ├── routes.py   # Calendar API routes (/events, /busy-times)
│   │       └── services.py # Calendar business logic and Google API integration
│   └── run.py              # Flask application entry point
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── PingTest.jsx    # Backend connectivity test
│   │   │   └── EventList.jsx   # Calendar events display
│   │   ├── pages/          # Page-level components
│   │   │   ├── LoginPage.jsx   # Google OAuth authentication
│   │   │   └── Dashboard.jsx   # Main calendar events page
│   │   └── App.jsx         # Main app with navigation and routing
├── .env                    # Environment variables (create this file)
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 Development

### Code Style
- **Extensive Comments**: All code includes detailed explanations for learning purposes
- **Error Handling**: Comprehensive error catching and user-friendly messages
- **Modular Design**: Clean separation between authentication, calendar, and UI logic
- **Responsive UI**: Mobile-friendly design with modern styling

### Testing
- Backend: Test API endpoints with curl or the built-in ping test
- Frontend: Built-in connectivity testing and error state display
- Integration: Full OAuth flow testing with Google Calendar access

### Contributing
This project is designed for learning and can be extended with additional features. The codebase includes extensive comments to help developers understand the implementation.

## 📚 Documentation

- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for detailed technical documentation
- **Planning**: See `Planning.md` for sprint planning and feature roadmap
- **Code Comments**: Every file includes extensive inline documentation

## 🌟 Status

**Current Phase**: Sprint 1 Complete ✅  
**Next Phase**: Sprint 2 - Group Creation & Multi-user Features

This project successfully demonstrates:
- Modern web application architecture
- Secure OAuth2 authentication flow
- Google API integration
- React component-based UI development
- Flask backend API design
- Cross-origin communication (CORS)
- Session management and state persistence

---

> **Perfect for learning**: This codebase is extensively commented and documented to help developers understand modern web application development with Python, Flask, React, and Google APIs.
