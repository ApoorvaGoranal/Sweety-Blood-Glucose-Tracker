# 🌸 Sweety – Blood Glucose Tracker

Sweety is a full-stack web application that helps users record, manage, and monitor their blood glucose readings. It provides daily and monthly reports with glucose statistics and a visual trend chart.

## 🚀 Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Add, view, update, and delete glucose readings
- Four daily reading slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Reading validation between 40 and 600 mg/dL
- Prevents duplicate readings for the same slot and date
- Prevents future-date entries
- Daily glucose reports
- Current-month and previous-month reports
- Highest, lowest, average, and total reading statistics
- Glucose trend chart
- User-specific reading access
- Responsive user interface

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router
- Recharts

### Backend
- Node.js
- Express.js
- PostgreSQL
- bcrypt
- JSON Web Token (JWT)
- dotenv
- CORS

## 📁 Project Structure

```text
Sweety/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── readingController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── readingRoutes.js
│   │   └── reportRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── GlucoseChart.jsx
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── .gitignore
└── README.md
```

## 💻 Requirements

Install the following before running the application:

- Node.js
- npm
- PostgreSQL
- Git
- Visual Studio Code (recommended)

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ApoorvaGoranal/Sweety-Blood-Glucose-Tracker.git
cd Sweety-Blood-Glucose-Tracker
```

### 2. Database Setup

1. Open PostgreSQL or pgAdmin.
2. Create a database named `sweety_db`.
3. Open the Query Tool for that database.
4. Execute the following SQL:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot VARCHAR(30) NOT NULL,
    value INTEGER NOT NULL CHECK (value BETWEEN 40 AND 600),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_reading_slot
        UNIQUE (user_id, reading_date, slot),
    CONSTRAINT valid_slot CHECK (
        slot IN (
            'Morning fasting',
            'After breakfast',
            'After lunch',
            'After dinner
