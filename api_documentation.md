 Seat Booking API Documentation

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

| Code | Status | Meaning |
|------|--------|---------|
| `ERR_INVALID_CREDENTIALS` | 401 | Incorrect username or password |
| `ERR_MISSING_CREDENTIALS` | 400 | Login: Username or password not provided |
| `ERR_CHANGE_PASS_FIELDS_MISSING` | 400 | Pass Change: Current or new password missing |
| `ERR_CHANGE_PASS_TOO_SHORT` | 400 | Pass Change: New password < 6 characters |
| `ERR_UNAUTHORIZED` | 403 / 401 | Not authorized to access this resource |
| `ERR_RESOURCE_NOT_FOUND` | 404 | The requested item does not exist |
| `ERR_VALIDATION_FAILED` | 400 | Missing or invalid request data |
| `ERR_SEAT_TAKEN` | 400 | The seat is already booked for this date |
| `ERR_CONFLICT` | 400 | Operation conflicts with existing data (e.g. perpetual vs manual) |
| `ERR_MANUAL_BOOKING_DATE_MISSING` | 400 | Admin Manual: No dates provided in request |
| `ERR_STATS_MONTH_MISSING` | 400 | Admin Stats: Month query parameter missing |
| `ERR_SEAT_ALREADY_BOOKED` | 400 | Booking: The seat is already booked for this date |
| `ERR_PERPETUAL_BOOKING_CONFLICT` | 400 | Admin Perpetual: Seat has existing future bookings |
| `ERR_USER_ALREADY_HAS_SEAT` | 400 | Booking: User already has a seat booked for today |
| `ERR_USER_EXISTS` | 400 | Admin: Username is already taken |
| `ERR_SERVER_ERROR` | 500 | An unexpected internal server error occurred |