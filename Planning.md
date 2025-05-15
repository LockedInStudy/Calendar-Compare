| Feature                     | Description                                           |
| --------------------------- | ----------------------------------------------------- |
|  Google Sign-in           | Authenticate users securely with OAuth2               |
|  Google Calendar Sync     | Fetch each user's calendar events                     |
|  Group Creation & Joining | Users can create a group or join via passcode         |
|  Availability Matching    | Compare group members’ calendars for shared free time |
|  UI                       | Show calendars and mutual free slots visually         |
|  (Optional/Later) Email   | Notify users of things                 |







# 📅 Calendar Compare – Project Plan (Detailed)

This document outlines the step-by-step development roadmap for the Calendar Compare project, divided into clear sprints. Each sprint introduces new folders and files gradually and explains what they do.

---

## ✅ Sprint 0 – Project Bootstrap

### 🎯 Goals
- Set up the backend with Flask.
- Set up the frontend with React.
- Make sure both servers run and can communicate.
- Add a simple `/ping` route to test backend.

### 📁 Files/Folders Created

```
calendar-compare/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── routes.py
│   └── run.py
├── .env
├── requirements.txt
├── Makefile
├── frontend/
│   └── [Created using Vite: React boilerplate]
```

### 🧠 What Each File Does

- `run.py` – Starts the Flask app using the `create_app()` factory.
- `__init__.py` – Builds and configures the Flask app.
- `config.py` – Loads settings from environment variables.
- `routes.py` – Adds a simple `/ping` route.
- `.env` – Stores secrets like `FLASK_ENV` and `SECRET_KEY`.
- `requirements.txt` – Lists Python packages.
- `Makefile` – Easy CLI for dev tasks.
- `frontend/` – Created with `npm create vite@latest`.

### ✅ Tasks

#### 🔧 Backend
- Create virtual environment: `.venv`
- Create `backend` folder with subfolders as shown.
- Set up Flask, `/ping` endpoint, and environment loading.
- Install `flask`, `python-dotenv`
- Test `/ping` route.

#### 🌐 Frontend
- Use Vite to scaffold React app.
- Confirm `npm run dev` works.
- Add a basic `PingTest.jsx` page to call backend `/ping`.

---

## ✅ Sprint 1 – Google Login and Fetch Events

### 🎯 Goals
- Let user log in via Google OAuth.
- Fetch their next 10 calendar events.
- Show these events on the frontend.

### 📁 Files/Folders Added

```
backend/
├── app/
│   ├── auth/
│   │   ├── routes.py
│   │   └── google.py
│   ├── calendars/
│   │   ├── routes.py
│   │   └── services.py

frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── Dashboard.jsx
│   ├── components/
│   │   └── EventList.jsx
```

### 🧠 What Each File Does

- `auth/routes.py` – `/login` and `/callback` for Google OAuth2.
- `auth/google.py` – Sets up OAuth flow and handles credentials.
- `calendars/routes.py` – `/events/me` to return user's calendar events.
- `calendars/services.py` – Calls Google Calendar API.
- `LoginPage.jsx` – UI with login button.
- `Dashboard.jsx` – Shows fetched events.
- `EventList.jsx` – Renders list of events.

### ✅ Tasks

#### 🔐 Backend – Auth
- Set up Google Cloud OAuth2 credentials.
- Add login and callback routes.
- Store tokens temporarily in session (or prepare DB later).
- Add `.env` variables for Google credentials.

#### 📅 Backend – Calendar
- Create `/events/me` endpoint that uses the stored token to fetch Google Calendar events.

#### 🌐 Frontend
- Add login button that redirects to `/login`.
- After login, redirect to `/dashboard` and fetch `/events/me`.
- Display results using `EventList`.

---

## ✅ Sprint 2 – Groups and Passcodes

### 🎯 Goals
- Create groups.
- Join groups via a passcode.
- View members of the group.

### 📁 Files/Folders Added

```
backend/
├── app/
│   ├── models.py
│   ├── groups/
│   │   └── routes.py

frontend/
├── src/
│   ├── components/
│   │   ├── CreateGroupForm.jsx
│   │   └── JoinGroupForm.jsx
│   ├── pages/
│   │   └── GroupPage.jsx
```

### 🧠 What Each File Does

- `models.py` – SQLAlchemy models for User, Group, Membership.
- `groups/routes.py` – Endpoints: create group, join by passcode, list members.
- `CreateGroupForm.jsx` – Form to create a group.
- `JoinGroupForm.jsx` – Form to enter a passcode.
- `GroupPage.jsx` – Displays group details and member list.

### ✅ Tasks

#### 🗄️ Backend
- Set up SQLAlchemy and Flask-Migrate.
- Define and create models.
- Implement group endpoints:
  - `POST /groups`
  - `POST /groups/join`
  - `GET /groups/<id>`

#### 🌐 Frontend
- Create forms to create and join groups.
- Fetch and display group members.

---

Would you like Sprint 3 (shared availability) and Sprint 4 (calendar UI + Slack notifications) written in the same format?
