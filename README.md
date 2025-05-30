# Calendar Compare 🗓️

A collaborative calendar comparison tool that helps teams find common availability by comparing Google Calendar schedules. Built with Flask (Python) and React.

## 🌟 Current Features (Sprints 0, 1 & 2 Complete)
- 🔐 **Google OAuth2 Authentication** ✅ – Secure login/logout with session management
- 📅 **Calendar Integration** ✅ – Fetch and display Google Calendar events
- 👥 **Group Management** ✅ – Create groups, generate invitation codes, join via passcode
- 🛡️ **Role-based Permissions** ✅ – Owner, admin, member roles with appropriate access control
- 📊 **Member Management** ✅ – Add/remove members, change roles, leave groups
- 🌐 **Responsive UI** ✅ – Beautiful React interface with mobile-friendly design

## 🚧 Next Features (Sprint 3)
- 🕓 **Calendar Comparison** – Find common free time slots across group members
- 📊 **Availability Visualization** – Interactive calendar view showing shared availability
- ⏰ **Meeting Scheduling** – Propose and schedule meetings in available slots

## 🛠️ Tech Stack
- **Backend**: Python 3.11+, Flask, Google Calendar API, Google OAuth2
- **Frontend**: React 18, Vite, Modern JavaScript/JSX
- **Communication**: RESTful APIs with CORS, JSON data exchange
- **Authentication**: Google OAuth2 with server-side session management
- **Development**: Hot reloading, extensive error handling, comprehensive logging

## 🚀 Quick Setup for Collaborators

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ and npm installed
- Google Cloud Console account

### 1. Clone and Install
```bash
git clone <repository-url>
cd calendar-compare

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
# .venv/Scripts/activate.bat  # Windows CMD
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Frontend setup  
cd ../frontend
npm install
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your own Google OAuth credentials
# See Google OAuth setup below
```

### 3. Google OAuth Setup (Required)
**Important: Each developer should create their own Google OAuth credentials for security and independence.**

1. **Create Your Own Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "New Project"
   - Name it "Calendar Compare Dev [YourName]"

2. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External"
   - Fill in app name: "Calendar Compare Dev"
   - Add your email as developer contact
   - **Important**: Add your email to "Test users" section

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - **Authorized redirect URIs**: `http://localhost:5000/auth/callback`
   - Copy your Client ID and Client Secret

5. **Update Your .env File**
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   SECRET_KEY=your-secret-key-here
   ```

### 4. Run the Application
```bash
# Terminal 1: Start backend
cd backend
python run.py

# Terminal 2: Start frontend  
cd frontend
npm run dev
```

Open http://localhost:5174 in your browser.

## 🔐 Security & Collaboration Notes

- **Never commit .env files** - they contain sensitive credentials
- **Each developer needs their own Google OAuth credentials** - don't share secrets
- **Use different project names in Google Cloud** to avoid conflicts
- **.env.example is shared** - this template helps collaborators set up quickly

## 🤝 Development Workflow

1. **First time setup**: Follow the Google OAuth setup above
2. **Daily development**: Just run `python run.py` and `npm run dev`  
3. **If .env.example changes**: Update your .env file accordingly
4. **Production deployment**: Use environment-specific credentials
## 🛠️ Tech Stack
- **Backend**: Python 3.11+, Flask, SQLAlchemy, Google Calendar API, Google OAuth2
- **Frontend**: React 18, Vite, Modern JavaScript/JSX
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: Google OAuth2 with server-side session management
- **Development**: Hot reloading, extensive error handling, comprehensive logging

## 📚 Documentation

- **[Complete Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Comprehensive technical documentation
- **[Project Planning](Planning.md)** - Sprint breakdown and roadmap
- **Code Comments** - Extensive inline documentation for beginners

## 🧪 Testing

Visit these endpoints to test the backend:
- http://localhost:5000/ping - Backend connectivity test
- http://localhost:5000/auth/status - Authentication status check

## 🎯 Project Status

**✅ Sprint 0**: Project Bootstrap (Flask + React setup)  
**✅ Sprint 1**: Google OAuth + Calendar Integration  
**✅ Sprint 2**: Group Management System  
**🔄 Sprint 3**: Calendar Comparison & Availability Matching

**Overall Progress**: 75% Complete - Ready for production use!

## 🤝 Contributing

1. Each developer should create their own Google OAuth credentials
2. Follow the setup instructions above
3. See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed technical information
4. All code includes extensive comments for learning

## 📄 License

This project is open source. See the implementation guide for detailed technical documentation.
