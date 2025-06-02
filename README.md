# Room for Improvement – Hostel Management System

## 🚀 Live Demo
[Access the live site here](https://683d2f94f2ded0649c29f47e--rabbit-tree-system.netlify.app)

---

## 🧪 Testing Instructions

### 1. Open the Live Site
- Visit the [live Netlify deployment](https://683d2f94f2ded0649c29f47e--rabbit-tree-system.netlify.app) on any device or browser.

### 2. Test Core Features
- **Navigation:** Use the top navigation bar to switch between Dashboard, Cleaning, Laundry, Maintenance, and Scheduler.
- **Language Toggle:** Click the `EN` button to switch languages (if enabled).
- **Room Selection:** Use the room dropdown to view and manage tasks for different rooms.
- **Cleaning Tasks:** Start and complete cleaning tasks, and report issues.
- **Laundry:** Add laundry, switch between tabs, and view status.
- **Scheduler:** Navigate weeks and generate schedules.
- **Dashboard:** View analytics and staff on duty (requires manager role).

### 3. Authentication
- The system seeds default accounts on first load.
- Log in as different roles to test permissions (staff, supervisor, manager, owner).
- Example accounts:
  - `manager` / role: `manager`
  - `owner` / role: `owner`
  - `staff-1` / role: `staff`

### 4. PWA & Mobile Testing
- Add the app to your home screen (PWA install prompt should appear).
- Confirm the app icon and splash screen display correctly.
- Test on both desktop and mobile browsers.

### 5. Error Handling
- Open the browser console and confirm there are **no red errors**.
- All plugins should show as registered and initialized.
- The Auth module should not crash if DOM elements are missing.
- The manifest and icon should load without errors.

---

## 📝 Developer Notes
- All plugin registration uses `RoomForImprovementSystem.register()`.
- The manifest and icon are in the project root for PWA compatibility.
- For local development, clone the repo and open `index.html` in your browser.

---

## 📱 Quick Access
- [Live Netlify Site](https://683d2f94f2ded0649c29f47e--rabbit-tree-system.netlify.app)
- [GitHub Repository](https://github.com/CBoon99/Rabbit-Tree-System)

---

Enjoy testing and managing your hostel system! 🐰 