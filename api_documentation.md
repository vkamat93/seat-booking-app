# Seat Booking API Documentation

This document describes the API endpoints, request/response formats, and error codes for the Seat Booking Application.

## Base URL
All API requests are prefixed with: `/api`

## Authentication
Most endpoints require a JSON Web Token (JWT) for authentication.
Include the token in the `Authorization` header using the `Bearer` scheme:
```
Authorization: Bearer <your_jwt_token>
```

## Standard Response Format

All responses follow a consistent JSON structure:

### Success Response (200 OK)
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "code": "ERR_CODE",
  "message": "Descriptive error message",
  "data": null
}
```

---

## Authentication Endpoints

### Login
`POST /auth/login`
Authenticate a user and retrieve a token. Auto-creates the user on first login if authorized.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "your_password"
}
```

**Response Data:**
Returns user profile and `token`.

### Get Current User
`GET /auth/me`
Retrieve profile information for the currently authenticated user.

---

## Seat Endpoints

### Get All Seats
`GET /seats`
Retrieve the status and layout of all seats.

**Response Data:** Array of Seat objects.

### Book a Seat
`POST /seats/book/:seatId`
Book a specific seat for the currently logged-in user for today.

### Release Seat
`POST /seats/release`
Release the seat currently held by the logged-in user.

---

## Admin Endpoints

### Dashboard Stats
`GET /admin/stats`
Retrieve high-level summary statistics for the admin dashboard.

### User Management
- `GET /admin/users`: List all users (with search and pagination)
- `POST /admin/users`: Create a new user
- `PUT /admin/users/:id`: Update user role or status
- `DELETE /admin/users/:id`: Deactivate a user
- `PUT /admin/users/:id/reset-password`: Reset a user's password to a random temporary one

### Booking Management
- `GET /admin/bookings`: Retrieve booking history with filters (`startDate`, `endDate`, `userId`, `seatId`, `status`)
- `GET /admin/bookings/future`: Retrieve all future scheduled bookings
- `GET /admin/bookings/perpetual`: List all permanent seat assignments
- `POST /admin/bookings/perpetual`: Assign a seat permanently to a user
- `DELETE /admin/bookings/perpetual/:seatId`: Remove permanent status from a seat
- `POST /admin/bookings/manual`: Schedule a seat for specific future dates
- `POST /admin/bookings/release`: Mass release/cancel bookings based on criteria

---

## Error Codes

The system uses specific, unique error codes for every failure scenario to aid in diagnostics.

### Authentication & Authorization
| Code | Status | Meaning |
|------|--------|---------|
| `ERR_LOGIN_MISSING_CREDENTIALS` | 400 | Login: Username or password not provided |
| `ERR_AUTH_USERNAME_UNAUTHORIZED` | 403 | Username is not in the allowed list |
| `ERR_LOGIN_INVALID_DEFAULT_PASSWORD` | 401 | First login: Incorrect default password |
| `ERR_LOGIN_INVALID_CREDENTIALS` | 401 | Incorrect password for existing user |
| `ERR_CHANGE_PASS_FIELDS_MISSING` | 400 | Current or new password missing |
| `ERR_CHANGE_PASS_TOO_SHORT` | 400 | New password is less than 6 characters |
| `ERR_INVALID_PASSWORD` | 401 | Current password provided is incorrect |
| `ERR_UNAUTHORIZED` | 401/403 | Generic authorization failure |
| `ERR_AUTH_LOGIN_SERVER_ERROR` | 500 | Server error during login process |
| `ERR_AUTH_ME_SERVER_ERROR` | 500 | Server error fetching user profile |
| `ERR_AUTH_CHANGE_PASSWORD_SERVER_ERROR` | 500 | Server error changing password |

### Seat Operations (User)
| Code | Status | Meaning |
|------|--------|---------|
| `ERR_USER_ALREADY_HAS_SEAT` | 400 | User already has a seat booked for today |
| `ERR_BOOKING_SEAT_NOT_FOUND` | 404 | The requested seat could not be found |
| `ERR_SEAT_ALREADY_BOOKED` | 400 | The seat is already taken for the requested date |
| `ERR_NO_SEAT_TO_RELEASE` | 400 | User has no active seat to release |
| `ERR_SEATS_FETCH_SERVER_ERROR` | 500 | Server error retrieving seat list |
| `ERR_SEATS_BOOK_SERVER_ERROR` | 500 | Server error during booking transaction |
| `ERR_SEATS_RELEASE_SERVER_ERROR` | 500 | Server error during release transaction |

### Admin Operations
| Code | Status | Meaning |
|------|--------|---------|
| `ERR_USER_EXISTS` | 400 | Username already exists in the system |
| `ERR_ADMIN_USER_UPDATE_NOT_FOUND` | 404 | User to update does not exist |
| `ERR_ADMIN_USER_DELETE_NOT_FOUND` | 404 | User to delete does not exist |
| `ERR_ADMIN_USER_PASSWORD_RESET_NOT_FOUND` | 404 | User for password reset not found |
| `ERR_ADMIN_PERPETUAL_BOOKING_SEAT_NOT_FOUND` | 404 | Seat for perpetual assignment not found |
| `ERR_PERPETUAL_BOOKING_CONFLICT` | 400 | Seat has existing future bookings |
| `ERR_ADMIN_PERPETUAL_BOOKING_DELETE_NOT_FOUND` | 404 | Perpetual seat for removal not found |
| `ERR_MANUAL_BOOKING_DATE_MISSING` | 400 | No dates provided for manual booking |
| `ERR_STATS_MONTH_MISSING` | 400 | Month parameter missing for user stats |
| `ERR_ADMIN_STATS_SERVER_ERROR` | 500 | Server error fetching dashboard stats |
| `ERR_ADMIN_USERS_FETCH_SERVER_ERROR` | 500 | Server error fetching user list |
| `ERR_ADMIN_USER_CREATE_SERVER_ERROR` | 500 | Server error during user creation |
| `ERR_ADMIN_USER_UPDATE_SERVER_ERROR` | 500 | Server error during user update |
| `ERR_ADMIN_USER_DELETE_SERVER_ERROR` | 500 | Server error during user deletion |
| `ERR_ADMIN_USER_PASSWORD_RESET_SERVER_ERROR` | 500 | Server error during password reset |
| `ERR_ADMIN_BOOKINGS_FETCH_SERVER_ERROR` | 500 | Server error fetching booking history |
| `ERR_ADMIN_BOOKINGS_FUTURE_SERVER_ERROR` | 500 | Server error fetching scheduled bookings |
| `ERR_ADMIN_BOOKINGS_PERPETUAL_FETCH_SERVER_ERROR` | 500 | Server error fetching perpetual list |
| `ERR_ADMIN_PERPETUAL_BOOKING_CREATE_SERVER_ERROR` | 500 | Server error creating perpetual assignment |
| `ERR_ADMIN_PERPETUAL_BOOKING_DELETE_SERVER_ERROR` | 500 | Server error removing perpetual status |
| `ERR_ADMIN_BOOKINGS_MANUAL_SERVER_ERROR` | 500 | Server error creating manual bookings |
| `ERR_ADMIN_BOOKINGS_MASS_RELEASE_SERVER_ERROR` | 500 | Server error during mass release |
| `ERR_ADMIN_USER_STATS_SERVER_ERROR` | 500 | Server error fetching user monthly stats |
| `ERR_SERVER_ERROR` | 500 | Generic unhandled server error |
