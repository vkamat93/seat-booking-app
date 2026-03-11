# 🏢 Office Desk Booking System

A full-stack MERN application for office desk reservation with whitelist-based authentication, mandatory password change on first login, and automatic daily reset.

## ✨ Features

- 🪑 **34 Office Desks** - Visual office layout with main section and right cluster
- 🔐 **Whitelist Authentication** - Only pre-approved users can access the system
- 🔑 **First Login Password Change** - Users must change their default password on first login
- 🔒 **Atomic Booking** - Prevents double-booking with MongoDB transactions
- 👤 **One Desk Per User** - Each user can book only one desk
- 👀 **Guest View** - Unauthenticated users can view desk availability (but not book)
- ⏰ **Auto-Release between 12AM - 5AM** - Desks automatically freed daily using node-cron
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


### NEW: 🔐 UserManagement

Edit `credentials.json` stored in `server/config` with the intended users (case-sensitive usernames):

```json
{
  "admin": "AdminPass123",
  "JohnDoe": "John@1234",
  "JaneSmith": "Jane@5678"
}
```

> **Note:** `credentials.json` is gitignored for security. The example file shows the expected format. Adding and removing users is to be done from the Admin Panel in the web-app in the future by Admin level users to avoid manually add/delete operations

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

#### POST `/api/auth/reset-with-default`
Reset user password using default credentials from `credentials.json`. Deletes existing user record and creates a new one. Transfers any existing seat booking to the new user.

**Request Body:**
```json
{
  "username": "JohnDoe",
  "defaultPassword": "John@1234"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful. Please set a new password.",
  "_id": "507f1f77bcf86cd799439099",
  "username": "JohnDoe",
  "role": "user",
  "mustChangePassword": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing username or default password
- `401` - Invalid default password
- `403` - Username not in whitelist

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
- ✅ Google reCAPTCHA v3 for bot protection

---

## 🤖 Google reCAPTCHA v3 Integration

The application uses **Google reCAPTCHA v3** to prevent automated scripts from booking seats. Unlike v2, reCAPTCHA v3 runs invisibly in the background and assigns a score (0.0 - 1.0) based on user behavior.

### How It Works

1. **Frontend** - When a user clicks to book a seat, the app executes reCAPTCHA and obtains a token
2. **Backend** - The token is sent with the booking request and verified with Google's API
3. **Score Check** - If the score is below `0.5`, the request is rejected as likely bot activity

### Setup

#### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site with **reCAPTCHA v3**
3. Add your domains (e.g., `localhost`, `yourdomain.com`)
4. Copy the **Site Key** and **Secret Key**

#### 2. Environment Variables

**Client** (`client/.env`):
```env
REACT_APP_RECAPTCHA_SITE_KEY=your-site-key-here
```

**Server** (`server/.env`):
```env
RECAPTCHA_SECRET=your-secret-key-here
```

### Implementation Details

**Frontend** (`react-google-recaptcha-v3`):
```javascript
// App.js - Provider wrapper
<GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
  <App />
</GoogleReCaptchaProvider>

// Execute on booking
const { executeRecaptcha } = useGoogleReCaptcha();
const token = await executeRecaptcha("action_string");
await seatsAPI.book(seatId, token);
```

**Backend** (`server/utils/captchaService.js`):
```javascript
async function verifyCaptcha(token) {
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: token
    })
  });
  return await response.json();
}
```

**Score Threshold**:
- `>= 0.5` - Human (allowed)
- `< 0.5` - Likely bot (rejected with 403 error)

### Error Response

When reCAPTCHA fails:
```json
{
  "message": "Our system prefers humans over robots.. Try booking from the WebApp"
}
```
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

Current version: **v2.0.3**

---

## 📜 Changelog

### v2.0.3 (2026-03-11)
**Google reCAPTCHA v3 Integration**

- 🤖 **Bot Protection** - Added Google reCAPTCHA v3 to prevent automated booking scripts
- 🛡️ Invisible captcha runs in background during seat booking
- 📊 Score-based validation (threshold: 0.5) to distinguish humans from bots
- ⚙️ New environment variables: `REACT_APP_RECAPTCHA_SITE_KEY` (client) and `RECAPTCHA_SECRET` (server)
- 🚫 Bots receive 403 error: "Our system prefers humans over robots.."

---

### v2.0.2 (2026-02-27)
**Modify JWT expiry and Cron job timing Feature**

- **Modified JWT expiry**
  - to deter script users from auto booking seat :P
- **Randomized Cron Job Time**
  - randomized the timing of the seat release cron job b/w 12AM and 5AM

---

### v2.0.1 (2026-02-25)
**Forgot Password Feature**

- ✨ **New Forgot Password page** - Users can reset their password using their default credentials from `credentials.json`
- 🔗 Added "Forgot Password?" link on Login page
- 🔄 **Password reset flow:**
  1. User enters their username and default password (from `credentials.json`)
  2. System verifies credentials against the whitelist
  3. Old user record is deleted and new one is created with `mustChangePassword: true`
  4. User is redirected to change password page
- 🪑 **Seat booking transfer** - When resetting password, any existing seat booking is automatically transferred to the new user record (fixes ghost user issue)
- 🛡️ Added `/auth/reset-with-default` API endpoint (public)
- 🔧 Fixed API interceptor to exclude reset endpoint from 401 redirect

---

### v2.0.0
- Initial release with core features
- Whitelist-based authentication
- First login password change requirement
- Guest view for desk availability
- Admin panel
- Responsive UI

---
