# Smart Habit Tracker: AI-Powered Behavioral Intelligence Platform
### Architecture, Algorithms, Features, and Reference Manual

This document provides a comprehensive technical overview of the **Smart Habit Tracker**—an advanced full-stack Behavioral Intelligence Platform inspired by James Clear's *Atomic Habits* and BJ Fogg's *Tiny Habits*.

---

## 🗺️ 1. High-Level System Architecture

The application is structured as a decoupled client-server system that uses stateless authentication, relational data persistence, and external generative AI models to provide dynamic, personalized coaching insights.

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer (React + Vite)
        UI[Glassmorphic UI / Dashboard]
        RC[React Routing & Context]
        AX[Axios HTTP Client + JWT Interceptor]
    end

    %% Gateway/Auth Layer
    subgraph Backend Layer (Spring Boot + Spring Security)
        SF[Spring Security Filter Chain]
        AC[REST Controllers]
        BI[Behavioral Intelligence Facade]
        
        subgraph Analysis Engines
            HD[Habit DNA Engine]
            FS[Future Self Simulator]
            FR[Failure Replay Engine]
            LB[Life Balance Radar Engine]
            MI[Mood Intelligence Engine]
            SE[Rule-Based Suggestion Engine]
            TH[Tiny Habits Scaler]
        end
        
        GS[Gemini API Service]
    end

    %% Database Layer
    subgraph Data Layer (MySQL 8.0)
        DB[(MySQL Database)]
        JP[Spring Data JPA Repositories]
    end

    %% External Services
    subgraph AI Service
        GM[Google Gemini API v1beta]
    end

    %% Connections
    UI --> RC
    RC --> AX
    AX -->|HTTPS + JWT Bearer Token| SF
    SF --> AC
    AC --> BI
    BI --> HD & FS & FR & LB & MI & SE & TH
    HD & FS & FR & LB & MI --> GS
    GS -->|REST Template| GM
    
    %% DB Connections
    HD & FS & FR & LB & MI & SE & TH & AC --> JP
    JP --> DB
```

### Architectural Design Patterns
1. **Facade Pattern**: The [BehavioralIntelligenceService.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/BehavioralIntelligenceService.java) acts as a unified entry point to the system's specialized analysis engines.
2. **Stateless JWT Security**: Sessions are not maintained on the server. The user sends their credentials, receives a signed JWT, and includes it in the `Authorization` header of subsequent requests.
3. **Robust Fallback Strategy (Local Heuristics)**: Each AI engine has a corresponding rule-based local algorithm. If the Gemini API key is missing or the external service returns an error, the system automatically falls back to local calculations, ensuring zero downtime.

---

## 📁 2. Directory Layout & Package Breakdown

### ☕ Backend Package Structure
```
backend/src/main/java/com/tracker/smarthabittracker/
│
├── SmartHabitTrackerApplication.java  # Main entry point & Spring Boot initializer
│
├── config/                            # Security, Cors, and JWT Configurations
│   ├── JwtAuthenticationFilter.java   # Token validation filter in filter chain
│   ├── JwtTokenProvider.java          # JWT token creator & parser
│   ├── SecurityConfig.java            # Spring Security paths & filter chain configurations
│   └── WebConfig.java                 # Global CORS mappings
│
├── controller/                        # REST Controllers
│   ├── AuthController.java            # Open endpoints for Registration & Login
│   ├── HabitController.java           # Habit logging and CRUD
│   ├── HabitStackController.java      # Habit stacking management
│   ├── TinyHabitController.java       # Acceptance/dismissal of micro-habits
│   ├── DashboardController.java       # Aggregated quick statistics
│   ├── AnalyticsController.java       # Endpoint mapping for charts
│   ├── BehavioralIntelligenceController.java # Coordinates AI analysis
│   └── UserSettingsController.java    # Profiles and reminder controls
│
├── dto/                               # Data Transfer Objects
│   ├── AuthRequest.java               # Login parameters wrapper
│   ├── HabitDto.java                  # Habit data formatted with streaks
│   └── GeminiRequest.java             # JSON payload mapping for the Gemini API
│
├── exception/                         # Global Exception Handlers
│   ├── ResourceNotFoundException.java # Generic 404 handler
│   └── GlobalExceptionHandler.java    # Catches system exceptions and formats standard JSON responses
│
├── model/                             # JPA / Hibernate Database Entities
│   ├── User.java                      # Accounts containing roles and credentials
│   ├── Habit.java                     # Tracking definitions (category, frequency)
│   ├── HabitLog.java                  # Logs completed on specific dates
│   ├── HabitDnaProfile.java           # Mapped AI personality profiles
│   ├── FutureProjection.java          # Simulators stored data
│   ├── FailureAnalysis.java           # Low-performing habit recovery targets
│   ├── LifeBalanceScore.java          # Mapped ratings across categories
│   ├── MoodLog.java                   # User wellness status logs
│   ├── Suggestion.java                # Local engine recommendation posts
│   └── TinyHabitRecommendation.java   # Pending micro-habit recommendations
│
├── repository/                        # Spring Data JPA Repository Interfaces
│   └── HabitRepository.java           # Relational abstraction over MySQL tables
│
└── service/                           # Business Logic & Analytics Engines
    ├── UserService.java               # Auth validations and sign-ups
    ├── HabitService.java              # Streaks, logs, and completion updates
    ├── HabitDnaAnalyzer.java          # AI Archetypes selector
    ├── FutureSelfSimulator.java       # Compounds growth projections
    ├── FailureReplayAnalyzer.java     # Audits skips and reasons
    ├── LifeBalanceService.java        # Builds radar ratings
    ├── MoodIntelligenceService.java   # Maps emotional states
    ├── HabitStackService.java         # Directed graph manager for stacked cues
    ├── TinyHabitService.java          # Scales habits down below 40% performance
    ├── SuggestionEngineService.java   # Rule-based suggestions engine
    └── GeminiService.java             # Communication client for Gemini Flash 1.5
```

### ⚛️ Frontend Folder Structure
```
frontend/src/
│
├── main.jsx                           # Application bootstrap and stylesheet injection
├── App.jsx                            # Router, protected routes, and layouts configuration
│
├── context/
│   └── AuthContext.jsx                # Session state, login hooks, and request interceptors
│
├── services/
│   ├── api.js                         # Base Axios client with authorization headers configuration
│   └── trackerService.js              # REST service mappings for endpoint integrations
│
├── components/                        # UI Widgets & Visualization components
│   ├── Navbar.jsx                     # Topbar housing notifications dropdown
│   ├── Sidebar.jsx                    # Navigation links and panel shortcuts
│   ├── HabitCard.jsx                  # Single habit display (streaks, quick completion triggers)
│   ├── HabitModal.jsx                 # Form modal to add/edit habits
│   ├── LogModal.jsx                   # Check-in prompt with mood mapping inputs
│   ├── HabitStackBuilder.jsx          # UI to link routines
│   ├── HeatmapCalendar.jsx            # GitHub-style contribution grid of habit logs
│   ├── HabitDnaCard.jsx               # AI DNA profile display card
│   ├── FutureSelfSimulation.jsx       # Projected Compound growth chart (Recharts)
│   ├── LifeBalanceRadar.jsx           # Radar grid of active routines (Recharts)
│   ├── MoodIntelligenceMap.jsx        # Correlation plots (Recharts)
│   └── TinyHabitCard.jsx              # Tiny habits recommendation acceptance widget
│
└── pages/                             # Parent Page Views
    ├── Login.jsx                      # Form with JWT parsing logic
    ├── Register.jsx                   # Signup component
    ├── Dashboard.jsx                  # Summary widgets, active check-ins, heatmap grid
    ├── Habits.jsx                     # Habits configuration page
    ├── Analytics.jsx                  # Analytics page loading AI insights and Recharts
    ├── Suggestions.jsx                # Rule recommendations and tiny suggestions feed
    └── Settings.jsx                   # Reminder thresholds configuration
```

---

## 🗄️ 3. Relational Database Schema

The database model is managed via Hibernate annotations. The structural relationships are defined below:

```
                  +--------------------+
                  |       users        |
                  +--------------------+
                  | id (PK)            | <---------+
                  | username           |           |
                  | email              |           |
                  | password           |           |
                  | role               |           |
                  +--------------------+           |
                            |                      |
                            | (1-to-Many)          | (1-to-1)
                            v                      |
                  +--------------------+           |
                  |       habits       |           |
                  +--------------------+           |
            +---->| id (PK)            |           |
            |     | user_id (FK)       |           |
            |     | name               |           |
            |     | description        |           |
            |     | category           |           |
            |     | target_count       |           |
            |     | is_active          |           |
            |     +--------------------+           |
            |               |                      |
            | (1)           | (Many)               |
            |               v                      v
            |     +--------------------+   +---------------+
            |     |     habit_logs     |   | user_settings |
            |     +--------------------+   +---------------+
            +-----| habit_id (FK)      |   | user_id (FK)  |
                  | completed_date     |   | reminder_time |
                  | completed_time     |   | enable_push   |
                  | mood               |   +---------------+
                  | notes              |
                  +--------------------+
```

### Table Definitions & Purpose
1. **`users`**: Stores user authentication credentials, email, role (`USER`, `ADMIN`), and creation timestamps.
2. **`habits`**: Core habit configurations. Supports categorization (`FITNESS`, `STUDY`, `HEALTH`, `PRODUCTIVITY`, `SOCIAL`, etc.) and targeting.
3. **`habit_logs`**: Represents specific execution events. Includes completion date/time, and links a daily mood (`HAPPY`, `NEUTRAL`, `SAD`, `STRESSED`, `ENERGETIC`) and check-in note. An unique constraint `uq_habit_date` (`habit_id`, `completed_date`) ensures a habit cannot be logged twice on the same calendar day.
4. **`habit_stacks`**: Chains two habits together.
   * `cue_habit_id` (Foreign Key referencing `habits.id`)
   * `target_habit_id` (Foreign Key referencing `habits.id`)
5. **`tiny_habit_recommendations`**: Holds automatic recommendations triggered by consistency levels under $40\%$. Contains a accepted or dismissed state transition marker.
6. **`habit_dna_profiles`**: AI profile cache associated with the user.
7. **`future_projections`**: Stores compound growth projection datasets across 30, 90, and 180-day horizons.
8. **`failure_analysis`**: Caches audited reports for low-performing habits ($<80\%$).
9. **`life_balance_scores`**: Relational storage of radar parameters.
10. **`suggestions`**: Stores recommendations produced by the local rule engine.
11. **`notifications`**: User reminder queue.

---

## 🧠 4. Specialized Behavioral Engines & Algorithms

This section explains the formulas, logic, and code structures of the behavioral intelligence engines.

### 🧬 Habit DNA Engine
* **File Location**: [HabitDnaAnalyzer.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/HabitDnaAnalyzer.java)
* **Goal**: Discover the user's implicit tracking archetype and query Gemini for psychometric profiling.
* **Selection Logic**:
  * **Night Builder**: If $60\%$ of habit logs are stamped between `18:00` (6 PM) and `05:00` (5 AM).
  * **Weekend Warrior**: If $60\%$ of logs fall on `SATURDAY` or `SUNDAY`.
  * **Fast Starter**: If completions on Mon-Wed average $1.8\times$ higher than completions on Thu-Sun.
  * **Deep Focus Learner**: If `STUDY` or `PRODUCTIVITY` is the user's most tracked habit category.
  * **Consistency Master**: If daily check-ins average $>85\%$ completion rate of all active habits over the tracked window.
  * **Balanced Tracker**: Default fallback category.

---

### 📈 Future Self Simulation Engine
* **File Location**: [FutureSelfSimulator.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/FutureSelfSimulator.java)
* **Goal**: Model compound behavior changes over 30, 90, and 180 days.
* **Compound Growth Model**:
  1. **Calculate Base Consistency ($C$)**: The average 14-day completion rate of all active habits:
     $$C = \frac{1}{N} \sum_{i=1}^{N} \left( \frac{\text{Logs for Habit}_i}{14} \times 100 \right)$$
  2. **Calculate Net Growth ($g$)**: Growth scaling factor based on the consistency threshold ($55\%$ is the neutral point):
     $$g = \frac{C - 55.0}{100.0}$$
  3. **Simulate Projection over Horizon ($H$)**:
     $$\text{Projected Score} = C \times \left(1.0 + (g \times 0.01)\right)^{H}$$
     *Note: The score is constrained to the range $[10.0, 100.0]$.*

---

### 🔍 Failure Replay & Audit Engine
* **File Location**: [FailureReplayAnalyzer.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/FailureReplayAnalyzer.java)
* **Goal**: Isolate underperforming habits ($<80\%$ consistency) and identify failure triggers.
* **Audit Categories**:
  * `STRESS_INDUCED_BURNOUT`: More than $40\%$ of skips occur on days when the logged daily stress score is $\ge 4/5$.
  * `WEEKEND_SLUMP`: More than $60\%$ of skips occur on Saturday/Sunday.
  * `CONSISTENCY_DECAY`: Total skips over 14 days exceed 8, indicating a general loss of motivation.
  * `SCHEDULE_FRICTION`: Random weekday skips pointing to timing or cues conflicts.

---

### 🔗 Habit Stacking (Graph Cycle-Detection Engine)
* **File Location**: [HabitStackService.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/HabitStackService.java)
* **Goal**: Allow users to stack habits while ensuring there are no circular dependencies.
* **DFS Cycle-Detection Algorithm**:
  When a user links Habit A (Cue) to Habit B (Target), the service builds a directed graph of all existing stacks and runs a Depth-First Search (DFS) to check for cycles.
  ```java
  private boolean hasCycleDfs(Long current, Map<Long, List<Long>> adj, Set<Long> visited, Set<Long> recStack) {
      if (recStack.contains(current)) {
          return true; // Cycle detected
      }
      if (visited.contains(current)) {
          return false;
      }
      visited.add(current);
      recStack.add(current);

      List<Long> neighbors = adj.get(current);
      if (neighbors != null) {
          for (Long neighbor : neighbors) {
              if (hasCycleDfs(neighbor, adj, visited, recStack)) {
                  return true;
              }
          }
      }
      recStack.remove(current);
      return false;
  }
  ```
  If a cycle is detected, the API throws an `IllegalArgumentException`, preventing the circular stack from being saved.

---

### 📉 Tiny Habits Scaler
* **File Location**: [TinyHabitService.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/TinyHabitService.java)
* **Goal**: Scale down habits with completion rates below $40\%$ over a 7-day period.
* **Scaling Profiles**:
  * **Fitness / Exercise** $\rightarrow$ *10 Min Quick Exercise*
  * **Reading / Studying** $\rightarrow$ *Read 2 Pages*
  * **Meditation** $\rightarrow$ *2 Min Breathing Exercise*
  * **Hydration** $\rightarrow$ *Drink 1 Glass of Water*
  * **Journaling** $\rightarrow$ *Write 1 Sentence*

---

### 🚨 Suggestion Engine
* **File Location**: [SuggestionEngineService.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/SuggestionEngineService.java)
* **Goal**: Evaluates user log history against rule configurations:
  * **Consistency Drops**: Triggers when completion counts drop by $\ge 30\%$ week-over-week.
  * **Streak Warnings**: Triggers when the user's current streak reaches $AverageStreakBeforeBreak - 1$, prompting them to push past their old limit.
  * **Overload Alert**: Triggers when tracking $\ge 5$ habits with an overall completion rate $<50\%$.
  * **Time Optimization**: Recommends timing alignments when $\ge 70\%$ of completions are concentrated in a specific time block.

---

## 🤖 5. External AI Integration Flow (Google Gemini API)

The system integrates with the Gemini API to generate personalized coaching advice.

```
+--------------------+      1. Build Prompt      +--------------------+
|  Analysis Engine   | ------------------------> |   Gemini Service   |
+--------------------+                           +--------------------+
          ^                                                 |
          |                                                 | 2. Post HTTP Request
          |                                                 v
+--------------------+                           +--------------------+
| Return DTO / Model | <------------------------ |  Gemini Flash API  |
+--------------------+    4. Parse Clean JSON    +--------------------+
                           (Local Fallback if Error)
```

### 1. JSON-Strict Prompt Configuration
Prompts sent to the Gemini API enforce structured JSON outputs to prevent malformed text blocks. Here is an example prompt structure from `HabitDnaAnalyzer.java`:
```
You are an expert behavior coach and psychologist. Analyze this habit data and generate a 'Habit DNA Personality Profile'.
Archetype: [ARCHETYPE_NAME]
Total Habits Active: [COUNT]
Total Logs Checked-in: [COUNT]

Requirements:
1. Generate exactly 3 key strengths for this archetype.
2. Generate exactly 3 key weaknesses/vulnerabilities.
3. Provide exactly 1 paragraph (maximum 3 sentences) of coaching advice inspired by 'Atomic Habits'.
4. You MUST format the output as a valid JSON object containing exactly the keys: 'archetype', 'strengths', 'weaknesses', and 'coachingAdvice'. Do NOT write markdown, backticks, or any pre/post text.
```

### 2. Response Cleaning & Safe Deserialization
[GeminiService.java](file:///C:/Users/udayk_3visckl/.gemini/antigravity/scratch/smart-habit-tracker/backend/src/main/java/com/tracker/smarthabittracker/service/GeminiService.java) strips any surrounding Markdown block tags (such as ````json ... ````) returned by the API before parsing the payload:
```java
private String stripMarkdownCodeBlocks(String text) {
    if (text == null) return null;
    text = text.trim();
    if (text.startsWith("```json")) {
        text = text.substring(7);
    } else if (text.startsWith("```")) {
        text = text.substring(3);
    }
    if (text.endsWith("```")) {
        text = text.substring(0, text.length() - 3);
    }
    return text.trim();
}
```

---

## 🔒 6. Security & Token Architecture

The authentication layer uses Spring Security and JWT.

```
Client                                  Server Security Chain
  |                                               |
  |--- 1. POST /api/auth/login ------------------>| [Open Port] Verify Password
  |<-- 2. HTTP 200 OK + JWT Token (24h validity)-| Create Token + Sign
  |                                               |
  |--- 3. GET /api/habits (Header: Auth Bearer) ->| [Filter Chain] Validate Signature
  |                                               | Resolve Authentication to Context
  |<-- 4. HTTP 200 OK (Protected Data Payload) ---| Return Data
```

### Client Interceptor Implementation
Axios client setup inside `frontend/src/services/api.js` intercepts all outgoing requests to append the authorization header:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

---

## 🚀 7. Local Installation & Verification Guide

### System Requirements
* **Java**: JDK 17
* **Node.js**: Node 18+ (NPM 9+)
* **Database**: MySQL 8.0+
* **Build tool**: Maven 3.8+

### 1. Database Setup
1. Create the MySQL database:
   ```sql
   CREATE DATABASE smart_habit_tracker;
   ```
2. Import the schema and seed data:
   ```bash
   mysql -u root -p smart_habit_tracker < schema.sql
   ```
   *Note: This creates a default demo account with credentials:*
   * **Username**: `demo`
   * **Password**: `password123`

### 2. Configure Backend Properties
Update `backend/src/main/resources/application.properties` with your MySQL credentials and Google Gemini API key:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_habit_tracker?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT secret key for signature verification (minimum 256 bits)
app.jwt.secret=9a67a86c23018e6e5876cdba113aef130f1de23a1059f3c178229b40092fcd62
app.jwt.expiration-ms=86400000

# Google Gemini API configurations (Optional)
google.gemini.api.key=AIzaSyDoPPptA_P7C6PXHBY_q4QqKJXezAJcgxM
```

### 3. Run the Applications
* **Backend**:
  ```bash
  cd backend
  mvn clean spring-boot:run
  ```
  The API will start on `http://localhost:8080`.

* **Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  The development server will start on `http://localhost:5173`.
