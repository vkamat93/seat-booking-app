# 🏢 Office Desk Booking System

A full-stack MERN application for office desk reservation with whitelist-based authentication, mandatory password change on first login, and automatic daily reset.

## ✨ Features

- 🪑 **34 Office Desks** - Visual office layout with main section and right cluster
- 🔐 **Whitelist Authentication** - Only pre-approved users can access the system
- 🔑 **First Login Password Change** - Users must change their default password on first login
- 🔒 **Atomic Booking** - Prevents double-booking with MongoDB transactions
- 👤 **One Desk Per User** - Each user can book only one desk
- 👀 **Guest View** - Unauthenticated users can view desk availability (but not book)
- ⏰ **Auto-Release at 4:30 AM** - Desks automatically freed daily using node-cron
- 🎨 **Modern Responsive UI** - Works on desktop, tablet, and mobile devices
- 📊 **MongoDB Atlas** - Cloud database with connection pooling

## 🖥️ Office Layout

```
Main Section:                          Right Cluster:
[▮][491][492][493][494][495][▮]        [417][412] | [411][406]
[▮][490][489][488][487][486][▮]        [416][413] | [410][407]
─────────────────────────────          [415][414] | [409][408]
[480][481][482][483][484][485]
[479][478][477][476][475][474]

▮ = Structural pillars
```

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Context API for state management
- Responsive CSS (mobile-first)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- node-cron for scheduled tasks
- dotenv for environment configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd seat-booking-webapp
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
USER_CREDENTIALS={"admin":"AdminPass123","user1":"Pass1234","user2":"Pass5678"}
```

#### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `USER_CREDENTIALS` | JSON object of username:password pairs (case-sensitive) | `{"JohnDoe":"pass1"}` |

### 3. Frontend Setup

```bash
cd ../client
npm install
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Start Frontend (in a new terminal)

```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start both services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Multi-stage Frontend Dockerfile

The frontend uses a multi-stage build:
1. **Stage 1 (builder)**: Node.js builds the React app
2. **Stage 2 (production)**: nginx serves the static files and proxies API requests

## 📖 Usage

### Authentication Flow

1. **Login** - Enter your whitelisted username and default password (case-sensitive)
2. **Change Password** - First-time users must set a new password
3. **Book a Desk** - Click on an available (green) desk to book it
4. **View Bookings** - See which desks are occupied and by whom
5. **Auto-Release** - All desks are freed at 4:30 AM daily

### Desk Status Legend

| Color | Status |
|-------|--------|
| 🟢 Green | Available desk |
| 🔵 Blue | Your booked desk |
| 🔴 Red | Occupied by another user |

### Guest Access

- Unauthenticated users can view the desk layout
- Guests can see which desks are available/occupied
- Login is required to make bookings

## 🔐 User Management

Users are managed via the `USER_CREDENTIALS` environment variable:

```env
USER_CREDENTIALS={"JohnDoe":"Pass123","MaryJane":"Pass456"}
```

- **No registration** - Users are pre-defined in the whitelist
- **Case-sensitive** - Username `JohnDoe` ≠ `johndoe`
- **Auto-creation** - User accounts are created on first login
- **Password change required** - All users must change their default password

### Adding New Users

1. Add the username and default password to `USER_CREDENTIALS` in `.env`
2. Restart the server
3. Share the credentials with the user
4. User logs in and changes their password

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and get token. Auto-creates user on first login if username is in whitelist.

**Request Body:**
```json
{
  "username": "JohnDoe",
  "password": "Pass123"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "JohnDoe",
  "bookedSeat": null,
  "mustChangePassword": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing username or password
- `401` - Invalid credentials
- `403` - Username not in whitelist

---

#### GET `/api/auth/me`
Get current logged-in user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "JohnDoe",
  "bookedSeat": {
    "_id": "507f1f77bcf86cd799439022",
    "seatNumber": 485,
    "status": "booked"
  },
  "mustChangePassword": false
}
```

**Error Response:**
- `401` - Not authenticated

---

#### POST `/api/auth/change-password`
Change user's password. Required for first-time login.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "Pass123",
  "newPassword": "MyNewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully",
  "mustChangePassword": false
}
```

**Error Responses:**
- `400` - Missing passwords or new password too short (min 6 chars)
- `401` - Current password incorrect

---

### Seats Endpoints

#### GET `/api/seats`
Get all seats with their booking status. **Public endpoint** - no authentication required.

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439022",
    "seatNumber": 474,
    "row": 1,
    "status": "free",
    "bookedBy": null,
    "bookedAt": null
  },
  {
    "_id": "507f1f77bcf86cd799439023",
    "seatNumber": 475,
    "row": 1,
    "status": "booked",
    "bookedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "JohnDoe"
    },
    "bookedAt": "2026-02-07T09:30:00.000Z"
  }
]
```

---

#### POST `/api/seats/book/:seatId`
Book a specific seat. One seat per user limit.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `seatId` - MongoDB ObjectId of the seat

**Success Response (200):**
```json
{
  "message": "Seat booked successfully",
  "seat": {
    "_id": "507f1f77bcf86cd799439022",
    "seatNumber": 485,
    "row": 3,
    "status": "booked",
    "bookedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "JohnDoe"
    },
    "bookedAt": "2026-02-07T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Already have a booked seat / Seat already booked
- `401` - Not authenticated
- `404` - Seat not found

---

#### POST `/api/seats/release`
Release the current user's booked seat.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Seat released successfully"
}
```

**Error Responses:**
- `400` - No seat to release
- `401` - Not authenticated

---

### API Error Format

All error responses follow this format:

```json
{
  "message": "Error description here"
}
```

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after **7 days**.

---

## ⏰ Auto-Release Job

The application uses `node-cron` to automatically release all desk bookings daily.

**Schedule:** `30 4 * * *` (4:30 AM every day)

**Implementation:** `server/jobs/seatReleaseJob.js`

```javascript
cron.schedule('30 4 * * *', async () => {
  // Releases all desk bookings
  // Clears bookedSeat from all users
});
```

---

## 📁 Project Structure

```
seat-booking-webapp/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.js/.css
│   │   │   ├── Navbar.js/.css
│   │   │   ├── Seat.js/.css
│   │   │   └── SeatGrid.js/.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── ChangePassword.js
│   │   │   ├── Home.js/.css
│   │   │   ├── Login.js
│   │   │   └── Auth.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.js/.css
│   │   └── index.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── allowedUsers.js
│   │   └── db.js
│   ├── jobs/
│   │   └── seatReleaseJob.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Seat.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── seats.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,           // Unique, required, case-sensitive
  password: String,           // Hashed with bcrypt
  bookedSeat: ObjectId,       // Reference to Seat (nullable)
  mustChangePassword: Boolean, // Default: true
  createdAt: Date
}
```

### Seats Collection

```javascript
{
  _id: ObjectId,
  seatNumber: Number,         // 406-495
  row: Number,                // 1-10
  status: String,             // 'free' or 'booked'
  bookedBy: ObjectId,         // Reference to User (nullable)
  bookedAt: Date              // Booking timestamp (nullable)
}
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT authentication with 7-day expiration
- ✅ Whitelist-based user access control (case-sensitive)
- ✅ Mandatory password change on first login
- ✅ Protected routes on frontend and backend
- ✅ Environment variables for sensitive data
- ✅ MongoDB injection prevention with Mongoose
- ✅ Atomic transactions for booking operations
- ✅ CORS configuration

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: bad auth`
- Verify username and password in `MONGODB_URI`
- URL encode special characters in password

**Error:** `connection timed out`
- Add your IP to MongoDB Atlas Network Access whitelist
- Use `0.0.0.0/0` for development (allows all IPs)

### JSON Parse Error for USER_CREDENTIALS

**Error:** `Failed to parse USER_CREDENTIALS JSON`
- Ensure valid JSON format: `{"user":"pass"}`
- Avoid special characters like `$` in passwords
- Don't use line breaks in the JSON string

### Login Issues

**Error:** `Username not authorized`
- Check if username exists in `USER_CREDENTIALS`
- Usernames are **case-sensitive** (`JohnDoe` ≠ `johndoe`)

### Docker / nginx 404 on `/api/*`

- Ensure nginx config has the `/api/` proxy block
- Verify both containers are on the same Docker network
- Check backend container is running: `docker ps`

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Device |
|------------|--------|
| > 768px | Desktop |
| 481-768px | Tablet |
| 361-480px | Mobile |
| ≤ 360px | Small Mobile |

---

## 📄 Version

Current version: **v1.0.3**

---

Made with ❤️ by Duggu
