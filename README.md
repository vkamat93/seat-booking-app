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
USER_CREDENTIALS={"admin":"AdminPass
