# Rental Platform

A full-stack room rental management system built with React, Node.js/Express, and SQLite. The platform connects property owners with tenants through a secure booking and payment system.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

## Overview

The platform enables three user roles:

- **Owners:** List and manage rental properties
- **Tenants:** Browse, book, and pay for room rentals
- **Admins:** Manage users, monitor transactions, and view platform statistics

Key features include JWT-based authentication, Khalti payment integration, email notifications, and responsive design.

## Tech Stack

| Layer        | Technology                                                                             |
| ------------ | -------------------------------------------------------------------------------------- |
| **Frontend** | React 18.2, Vite 7.1, React Router 7.9, Styled Components 6.0, Tailwind CSS 4.1, Axios |
| **Backend**  | Node.js, Express 4.18, SQLite 3, JWT, Bcryptjs, Multer, Express Validator              |
| **Payment**  | Khalti Payment Gateway                                                                 |
| **Tools**    | ESLint, Nodemon                                                                        |

## Features

### Tenant Capabilities

- User registration and authentication via JWT
- Browse and search properties with filtering
- View detailed room information with images
- Book rooms with move-in/move-out dates
- Secure payment processing via Khalti
- View booking history and payment receipts
- Manage profile and account settings

### Owner Capabilities

- Create and manage property listings
- Upload multiple images per property
- Set pricing and manage availability
- View active bookings and rental history
- Receive notifications on new bookings

### Admin Capabilities

- User management with search and filtering
- Platform statistics and analytics
- Transaction monitoring and payment tracking

## Database Schema

| Table               | Purpose                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| **users**           | User accounts (owners, tenants, admins) with authentication and profile data |
| **rooms**           | Property listings with details, pricing, and availability                    |
| **room_images**     | Multiple images associated with properties                                   |
| **bookings**        | Rental bookings with dates, status, and pricing                              |
| **khalti_payments** | Payment records with Khalti transaction details                              |
| **notifications**   | User notifications for bookings, payments, and messages                      |
| **reviews**         | Property ratings and reviews from tenants                                    |
| **favorites**       | User's favorited properties                                                  |

## Payment Integration

The platform integrates Khalti for secure online payments in Nepal. The payment workflow:

1. Tenant initiates booking with move-in/move-out dates
2. Khalti payment page is displayed
3. Payment processed via mobile wallet or card
4. Booking status updated to completed upon payment confirmation
5. Owner receives notification, tenant receives receipt

**Supported Methods:** Mobile wallet, debit card, credit card  
**Currency:** NPR (Nepalese Rupees)

---

## Project Structure

```
rental-platform/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/database.js
│   │   ├── controllers/          (Business logic)
│   │   ├── middleware/           (Auth, file upload)
│   │   ├── routes/               (API endpoints)
│   │   ├── services/             (Email notifications)
│   │   └── uploads/              (Images storage)
│   ├── server.js
│   ├── rental.db
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/             (API client, auth)
│   │   ├── styles/
│   │   ├── hooks/
│   │   └── utils/
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites

- Node.js v16+
- npm v7+

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
KHALTI_SECRET_KEY=your_khalti_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_KHALTI_PUBLIC_KEY=your_khalti_public_key
```

## Running the Application

**Backend Server:**

```bash
cd backend
npm run dev
```

Runs on: `http://localhost:5000`

**Frontend Development:**

```bash
cd frontend
npm run dev
```

Runs on: `http://localhost:3000`

**Build Frontend for Production:**

```bash
cd frontend
npm run build
```

## API Endpoints

### Authentication (`/api/auth`)

- POST `/register` - Register user
- POST `/login` - Login user
- GET `/me` - Get current user
- PUT `/profile` - Update profile
- PUT `/password` - Change password
- POST `/forgot-password` - Request password reset
- POST `/reset-password/:token` - Reset password

### Users (`/api/users`)

- GET `/` - Get current user profile
- PUT `/` - Update profile
- GET `/all` - Get all users (admin)
- PUT `/:id` - Update user (admin)
- DELETE `/:id` - Delete user (admin)

### Rooms (`/api/rooms`)

- GET `/` - List all rooms with pagination
- POST `/` - Create room (owner)
- GET `/:id` - Get room details
- PUT `/:id` - Update room (owner)
- DELETE `/:id` - Delete room (owner)
- GET `/user/my-rooms` - Get owner's rooms
- GET `/user/favorites` - Get favorite rooms
- POST `/:id/favorite` - Add to favorites
- DELETE `/:id/favorite` - Remove from favorites

### Rentals/Bookings (`/api/rentals`)

- POST `/` - Create booking (tenant)
- GET `/` - Get user's bookings
- GET `/:id` - Get booking details
- PUT `/:id/status` - Update booking status (owner)
- GET `/requests/pending` - Get pending requests
- POST `/:id/approve` - Approve booking
- POST `/:id/reject` - Reject booking

### Payments (`/api/payments`)

- POST `/initialize` - Initialize Khalti payment
- POST `/verify` - Verify payment
- GET `/my-payments` - Get payment history (tenant)
- GET `/all` - Get all payments (admin)

### Notifications (`/api/notifications`)

- GET `/` - Get notifications
- PUT `/:id/read` - Mark as read
- GET `/unread` - Get unread notifications

### Admin (`/api/admin`)

- GET `/stats` - Get platform statistics
- GET /users - All users with filtering
- GET /rooms - All rooms
- GET /payments - Payment transactions
- GET /bookings/all - All bookings

### Contact (/api/contact)

- POST /message - Submit contact form message

---

## User Roles & Workflows

### Tenant Workflow

1. Sign up with email and password
2. Browse available rooms with filters
3. View room details and images
4. Add/remove rooms from favorites
5. Book room with move-in/move-out dates
6. Complete payment via Khalti
7. View booking confirmation
8. Download payment receipt
9. Access Tenant Dashboard
   - View rental history
   - View active bookings
   - Download/print receipts
10. Manage profile settings

### Owner Workflow

1. Sign up as property owner
2. Create room listings
   - Add title, description, address
   - Set price and availability
   - Upload multiple images
   - Add amenities
3. View Owner Dashboard
   - See active listings
   - Manage existing rooms
   - View bookings and requests
4. Receive booking notifications
5. Approve/reject booking requests
6. Track bookings and calendar

### Admin Workflow

1. Access Admin Dashboard
2. View platform statistics
3. Manage user accounts
   - View, search, and filter users
   - Verify or deactivate accounts
4. Review room listings and properties
5. Monitor payment transactions
6. View booking analytics

### Khalti Payment (Sandbox/Test Mode)

- Test Mobile Number: 981612345
- Test PIN: 1234
- Test OTP: 111111
- Sandbox URL: https://test-payment.khalti.com

### Environment Variables

#### Backend (.env)

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
KHALTI_PUBLIC_KEY=test_public_key_from_khalti
KHALTI_SECRET_KEY=test_secret_key_from_khalti
KHALTI_API_URL=https://a.khalti.com/api
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_KHALTI_PUBLIC_KEY=test_public_key_from_khalti
```

---

## Additional Information

### Database File Location

- Path: backend/rental.db
- Type: SQLite 3
- Size: Grows with user data and uploads

### File Uploads

- Directory: backend/uploads/
- Supported formats: JPG, JPEG, PNG
- Max file size: 5MB per image

### Session Management

- JWT tokens stored in localStorage (24 hours expiry)
- Automatic logout on token expiration

### CORS Configuration

- Frontend Origin: http://localhost:3000
- Backend allows cross-origin requests from frontend

---

Last Updated: April 21, 2026
