# 🏢 Office Desk Booking System

A full-stack MERN application for office desk reservation with automatic daily reset at 1:00 AM.

## Features

- 🪑 **10 Office Desks** - 2 rows × 5 desks visual layout
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 🔒 **Atomic Booking** - Prevents double-booking with MongoDB transactions
- 👤 **One Desk Per User** - Each user can book only one desk
- ⏰ **Auto-Release at 1 AM** - Desks automatically freed daily using node-cron
- 🎨 **Modern UI** - Responsive React interface with visual desk status
- 📊 **MongoDB Atlas** - Cloud database with connection pooling

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Context API for state management

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- node-cron for scheduled tasks

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

## Installation

### 1. Clone the repository

```bash
cd seat-book
```

### 2. Set up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier M0 is sufficient)
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Create a username and password
   - Set role to "Read and write to any database"
4. Whitelist your IP address:
   - Go to Network Access → Add IP Address
   - Add your current IP or use `0.0.0.0/0` for development (allows all IPs)
5. Get your connection string:
   - Go to Database → Connect → Connect your application
   - Copy the connection string (Node.js driver)

### 3. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB Atlas credentials:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Replace:
- `<username>` - Your MongoDB Atlas database username
- `<password>` - Your database user password (URL encode special characters)
- `<cluster>` - Your cluster name (e.g., cluster0.abc123)
- `<dbname>` - Database name (e.g., office-booking)

**Example:**
```env
MONGODB_URI=mongodb+srv://myuser:myPassword123@cluster0.mongodb.net/office-booking?retryWrites=true&w=majority
```

### 4. Frontend Setup

```bash
cd ../client
npm install
```

## Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5001`

### Start Frontend (in a new terminal)

```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

1. **Register** - Create a new account with username and password
2. **Login** - Sign in with your credentials
3. **Book a Desk** - Click on an available (green) desk to book it
4. **View Bookings** - See which desks are occupied and by whom
5. **Auto-Release** - All desks are freed at 1:00 AM daily

### Desk Status Legend

- 🖥️ **Green** - Available desk
- 💼 **Blue** - Your booked desk
- 🧑‍💻 **Red** - Occupied by another user

## Auto-Release Job

The application uses `node-cron` to automatically release all desk bookings at **1:00 AM every day**.

**Implementation:** `server/jobs/seatReleaseJob.js`

```javascript
cron.schedule('0 1 * * *', async () => {
  // Runs daily at 1:00 AM
  // Releases all desk bookings
});
```

**Cron Schedule Format:** `0 1 * * *`
- Minute: 0
- Hour: 1 (1 AM)
- Day of Month: * (every day)
- Month: * (every month)
- Day of Week: * (every day)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Desks

- `GET /api/seats` - Get all desks and their status
- `POST /api/seats/:seatId/book` - Book a desk (protected)
- `POST /api/seats/release` - Manually release all desks (admin)

## Database Schema

### Users Collection

```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  bookedSeat: ObjectId (ref: 'Seat'),
  createdAt: Date
}
```

### Seats Collection

```javascript
{
  seatNumber: Number (1-10),
  row: Number (1-2),
  isBooked: Boolean,
  bookedBy: ObjectId (ref: 'User'),
  bookedAt: Date
}
```

## Project Structure

```
seat-book/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Seat.js            # Desk schema
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── seats.js           # Desk routes
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── jobs/
│   │   └── seatReleaseJob.js  # Cron job
│   ├── server.js              # Express server
│   ├── .env                   # Environment variables
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js      # Navigation bar
    │   │   ├── Seat.js        # Desk component
    │   │   └── SeatGrid.js    # Desk layout grid
    │   ├── pages/
    │   │   ├── Home.js        # Main desk booking page
    │   │   ├── Login.js       # Login page
    │   │   └── Register.js    # Registration page
    │   ├── context/
    │   │   └── AuthContext.js # Auth state management
    │   ├── services/
    │   │   └── api.js         # Axios API client
    │   ├── App.js             # Main app component
    │   └── index.js           # React entry point
    └── package.json
```

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT authentication with 7-day expiration
- ✅ Protected routes on frontend and backend
- ✅ Input validation and sanitization
- ✅ MongoDB injection prevention with Mongoose
- ✅ CORS configuration
- ✅ Atomic transactions for desk booking

## Troubleshooting

### MongoDB Atlas Connection Issues

**Error:** `MongoServerError: bad auth`
- Check username and password are correct
- Ensure password doesn't contain special characters (or URL encode them)

**Error:** `getaddrinfo ENOTFOUND`
- Verify cluster name is correct
- Check internet connection
- Ensure MongoDB Atlas cluster is running

**Error:** `connection timed out`
- Add your IP to Network Access whitelist
- Check firewall settings

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port in .env
PORT=5002
```

**React proxy errors:**
- Ensure backend is running on port 5001
- Check `proxy` in `client/package.json`

## Production Deployment

### 🐳 Docker Deployment (Recommended)

The easiest way to deploy is using Docker. All configuration files are included.

#### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed


Made with ❤️ using MERN Stack