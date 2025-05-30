# Manual UI Testing Checklist - Sprint 2 Group Management

## Test Environment
- Frontend: http://localhost:5174
- Backend: http://localhost:5000
- Date: May 30, 2025

## Pre-Test Setup
- ✅ Backend Flask server running on port 5000
- ✅ Frontend Vite server running on port 5174
- ✅ Database schema verified with test_db.py
- ✅ API endpoints verified with test_api.py

## Test Cases

### 1. Home Page & Navigation ✅
**URL**: http://localhost:5174
**Expected**:
- [ ] Page loads without errors
- [ ] Navigation bar displays with "📅 Calendar Compare" title
- [ ] Home, Login, Dashboard buttons visible
- [ ] Feature overview showing Sprint 0, 1, 2 completed
- [ ] PingTest component visible

**Actions to Test**:
- [ ] Click "Test Backend" button - should show success response
- [ ] Navigate between Home, Login, Dashboard tabs
- [ ] Verify responsive layout on different screen sizes

### 2. Backend Connectivity Test ✅
**Component**: PingTest
**Expected**:
- [ ] "Test Backend" button visible and clickable
- [ ] Click shows "Testing..." state
- [ ] Success response shows green message with JSON data
- [ ] Response includes: {"message": "pong", "status": "success"}

### 3. Login Page 🔄
**Navigation**: Click "🔐 Login" button
**Expected**:
- [ ] Login page loads without errors
- [ ] Google OAuth instructions/button visible
- [ ] Page explains authentication requirement
- [ ] No JavaScript errors in console

### 4. Dashboard Page 🔄
**Navigation**: Click "📊 Dashboard" button
**Expected**:
- [ ] Dashboard page loads without errors
- [ ] Shows message about login requirement (since not authenticated)
- [ ] Group management sections visible
- [ ] No JavaScript errors in console

### 5. Create Group Page 🔄
**Navigation**: Dashboard → Group section (may require login simulation)
**Expected**:
- [ ] Create Group form loads without errors
- [ ] Form fields for group name, description visible
- [ ] Submit button present
- [ ] Form validation works
- [ ] Proper error handling for unauthenticated users

### 6. Join Group Page 🔄
**Navigation**: Dashboard → Join Group section
**Expected**:
- [ ] Join Group form loads without errors
- [ ] Input field for invitation code visible
- [ ] Submit button present
- [ ] Form validation works
- [ ] Proper error handling for unauthenticated users

### 7. Group Dashboard Page 🔄
**Navigation**: From Dashboard → View specific group
**Expected**:
- [ ] Group Dashboard loads without errors
- [ ] Group information section visible
- [ ] Member list component present
- [ ] Admin controls (if applicable)
- [ ] Leave group functionality
- [ ] Join code sharing feature

### 8. Component Integration Tests 🔄

#### MemberList Component
- [ ] Renders member list properly
- [ ] Shows member roles correctly
- [ ] Admin actions work (add/remove members)

#### GroupList Component  
- [ ] Displays user's groups
- [ ] Navigate to group dashboard works
- [ ] Group creation/joining integration

#### EventList Component
- [ ] Event display formatting
- [ ] Calendar data integration
- [ ] Loading states

### 9. Error Handling & Edge Cases 🔄
- [ ] Network errors handled gracefully
- [ ] Unauthenticated API calls show proper messages
- [ ] Form validation prevents invalid submissions
- [ ] Loading states work correctly
- [ ] Empty states (no groups, no events) display properly

### 10. User Experience & Polish 🔄
- [ ] Consistent styling across all pages
- [ ] Responsive design works on mobile/tablet
- [ ] Intuitive navigation flow
- [ ] Clear feedback for user actions
- [ ] No broken links or buttons

## Test Results Summary

### ✅ PASSED
- Backend connectivity (PingTest component)
- Navigation system
- Component compilation
- Server setup

### 🔄 IN PROGRESS
- Manual UI testing of all components
- Integration between frontend and backend
- Complete user flow testing

### ❌ ISSUES FOUND
- (To be filled during testing)

## Notes
- Full authentication testing requires Google OAuth setup
- Some features may show placeholder content without real authentication
- Database operations can be tested with mock authentication
