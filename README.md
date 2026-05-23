# Smart Habit Tracker

Smart Habit Tracker is a full-stack, production-grade web application designed for student resumes. It helps users manage routines, tracks daily completions, calculates streaks, and analyzes consistency using a **rule-based smart suggestion engine** (running fully locally on the backend). 

---

## ⚡ Tech Stack

*   **Backend**: Java 17, Spring Boot 3.2.5, Spring Security, JWT (Stateless Authentication), Hibernate/JPA, Maven
*   **Frontend**: React 18, Vite, Tailwind CSS v3, Axios, Recharts, Lucide Icons
*   **Database**: MySQL 8.0
*   **Notifications**: Browser Desktop Push Alerts (using HTML5 Notification API)
*   **AI Recommendations**: Rules-based heuristics (consistency drops, streak warning thresholds, time of day efficiency, and mood correlations)

---

## 📂 Project Structure

```
smart-habit-tracker/
├── backend/
│   ├── src/main/java/com/tracker/smarthabittracker/
│   │   ├── config/          # JWT and Spring Security Configurations
│   │   ├── controller/      # REST API Controllers (Auth, Habits, Analytics, etc.)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Global exception filters
│   │   ├── model/           # Hibernate Entities (User, Settings, Habits, Logs)
│   │   ├── repository/      # Spring Data JPA Repository interfaces
│   │   └── service/         # Business logic & AI Recommendation Engine
│   └── pom.xml              # Maven dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Glassmorphic UI Cards, Sidebar, Navbar
│   │   ├── context/         # AuthContext session managers
│   │   ├── pages/           # Dashboard, My Habits, Analytics, AI Tips, Settings
│   │   ├── services/        # Axios API clients
│   │   └── index.css        # Tailwind core directives & global styles
│   ├── tailwind.config.js   # Tailwind custom slate-dark tokens
│   └── package.json         # React NPM dependencies
└── schema.sql               # Database schema definition & seed data
```

---

## 🤖 Rule-Based Suggestion Engine Logic

The suggestions engine runs on the backend (fully free, no paid APIs) and triggers suggestions whenever the user loads the Suggestions page or the Dashboard:

1.  **Consistency Drop Alert**: If habit completions in the last 7 days drop by $\ge 30\%$ compared to the 7 days prior, it prompts: *"Your consistency for [Habit] dropped by X%... Let's rebuild momentum today!"*
2.  **Streak Break Warning**: Identifies the user's historical average streak length before breaking. If the current streak reaches `Average - 1` days, it alerts: *"Historically, you tend to break your streak around X days. Complete it today to break past your old limit!"*
3.  **Time Optimization Match**: Groups completions into Morning (5AM-12PM), Afternoon (12PM-5PM), Evening (5PM-9PM), and Night (9PM-5AM). If a habit is completed in one window $\ge 70\%$ of the time, it suggests: *"You are highly consistent in the [Period]... Schedule future routines during this time!"*
4.  **Overload Alert**: If the user tracks $\ge 5$ active habits and has an overall completion rate $< 50\%$, it warns: *"You have X active habits but a rate of Y%. Focus on your top 3 habits first."*
5.  **Mood Correlation**: Checks mood entries (`HAPPY`, `NEUTRAL`, `SAD`, `STRESSED`, `ENERGETIC`). If completions drop significantly during `SAD` or `STRESSED` periods, it suggests: *"Consistency drops when feeling down. Commit to a 2-minute 'micro-version' on busy days."*
6.  **Target Reduction**: If a habit's 30-day completion rate remains $< 30\%$ after 14 days, it recommends: *"Consider reducing your target count to build confidence."*

---

## ⚙️ Running Locally

### 1. Database Setup
1. Open MySQL Command Line or Workbench:
   ```sql
   CREATE DATABASE smart_habit_tracker;
   ```
2. Source the schema file:
   ```sql
   mysql -u root -proot smart_habit_tracker < schema.sql
   ```
This seeds a default user with demo data:
*   **Username**: `demo`
*   **Password**: `password123`

### 2. Run Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
The backend API starts running on `http://localhost:8080`.

### 3. Run Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
Open `http://localhost:5173` in your browser.

---

## 🔒 Security Configuration
All routes except `/api/auth/**` are protected by stateless JWT token authentication.
The token contains the user's roles and expires in 24 hours. Tokens are stored securely in the React App's `localStorage` and automatically appended in headers by Axios request interceptors.

---

## 📊 Analytics
Uses **Recharts** to draw dark-mode optimized charts mapping:
*   Weekly progress check-ins.
*   15-day scrollable area timelines.
*   Visual category shares (Pie Chart).
*   Horizontal time of day bar charts.
*   Polar radar charts mapping completions to Mood tags.
