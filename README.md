# 🏢 Office Desk Booking System

A full-stack MERN application for office desk reservation featuring an interactive seat map, administrative dashboard, and automated daily resets.

## 📂 Project Structure

```text
seat-booking-webapp/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # React components, pages, and context
│   │   ├── admin/          # Admin Dashboard components and pages
│   │   ├── components/     # UI components (Seat, Navbar, etc.)
│   │   ├── pages/          # Main application pages
│   │   └── services/       # API integration services
│   └── package.json        # Client-side dependencies and scripts
│
├── server/                 # Backend Node.js/Express server
│   ├── config/             # DB and whitelist configuration
│   ├── jobs/               # Scheduled tasks (Daily auto-release)
│   ├── middleware/         # Auth and Admin protection
│   ├── models/             # Mongoose schemas (User, Seat, Booking)
│   ├── routes/             # API endpoints (Auth, Seats, Admin)
│   ├── promoteAdmin.js     # Admin promotion utility
│   └── package.json        # Server-side dependencies and scripts
│
└── docker-compose.yml      # Container orchestration
```

## ✨ Key Features

- 🪑 **Interactive Seat Map**: 34 desks with real-time status and occupant hover info.
- 🔐 **Secure Access**: Whitelist-based authentication with mandatory password rotation.
- 🛡️ **Admin Dashboard**: Full control over users, bookings, and occupancy statistics.
- 📊 **Searchable Stats**: Advanced search-as-you-type for user-specific usage analytics.
- ⏰ **Daily Reset**: Automated seat release at 4:30 AM via `node-cron`.
- 🐳 **Dockerized**: Easy deployment using Docker and Docker Compose.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Docker (optional)

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd seat-booking-webapp

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/seatbooking
JWT_SECRET=your_jwt_secret_key
USER_CREDENTIALS={"admin":"Pass123","user1":"Pass123"}
```

## 🛠️ Build & Deployment

### Local Development
```bash
# In server directory
npm run dev

# In client directory (new terminal)
npm start
```

### Production Build
```bash
# Build the React frontend
cd client && npm run build
```

### Docker Deployment (Recommended)
```bash
# Build and start services
docker-compose up --build -d
```

## 🔐 Admin & User Management

### How to Promote a User to Admin
Grant admin privileges to any registered user using the provided utility:

```bash
cd server
node promoteAdmin.js <username>
```

### Whitelist Management
Add new authorized users by updating the `USER_CREDENTIALS` JSON object in your server `.env` file. Users are automatically created upon their first successful login.

## 🔌 API Summary
- `GET /api/seats`: Fetch live seat map
- `POST /api/auth/login`: Identity verification
- `GET /api/admin/stats`: General dashboard metrics
- `GET /api/admin/users`: User management with sorting/pagination

---
