# 🏠 Rental Platform - FYP

A comprehensive full-stack web application for room rental management system built with modern technologies. The platform enables owners to list properties and tenants to rent rooms with integrated payment processing.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [Payment Integration](#payment-integration)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [User Roles & Workflows](#user-roles--workflows)
- [Credentials](#credentials)

---

## 🎯 Project Overview

**Rental Platform** is a complete room rental management system that facilitates:

- **Property Owners** to list and manage rental properties
- **Tenants** to browse, book, and pay for room rentals
- **Admins** to oversee the platform, manage users, and view analytics

The platform features a secure authentication system, payment integration via Khalti, and a responsive UI designed for all devices.

---

## 🛠️ Tech Stack

### **Frontend**

- **React 18.2** - UI library for building interactive user interfaces
- **Vite 7.1** - Fast build tool and development server
- **React Router DOM 7.9** - tenant-side routing and navigation
- **Styled Components 6.0** - CSS-in-JS for component styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Icons** - Ionicons icon package
- **Axios** - HTTP tenant for API requests
- **ESLint** - Code quality and linting

### **Backend**

- **Node.js & Express 4.18** - Server framework and HTTP utilities
- **SQLite3 5.1** - Embedded SQL database
- **JWT (jsonwebtoken 9.0)** - Secure authentication tokens
- **Bcryptjs 2.4** - Password hashing and encryption
- **Multer 1.4** - File upload and image handling
- **Express Validator 7.0** - Request validation middleware
- **CORS 2.8** - Cross-origin resource sharing
- **Axios** - External API requests (Khalti payment gateway)
- **Nodemon 3.0** - Development auto-restart

### **Database**

- **SQLite 3** - Lightweight, file-based SQL database
- **Location**: `backend/rental.db`

### **Payment Gateway**

- **Khalti Payment Gateway** - Mobile wallet and online payment solution for Nepal

---

## ✨ Features

### **Tenant Features**

- ✅ User registration and authentication
- ✅ Browse available rental properties
- ✅ View detailed room information with images
- ✅ Book rooms with specific dates
- ✅ Secure payment via Khalti gateway
- ✅ View rental history
- ✅ Download and print payment receipts
- ✅ Manage profile and preferences
- ✅ Rate and review rental properties

### **Owner Features**

- ✅ User registration and authentication
- ✅ Create and manage property listings
- ✅ Upload multiple images per property
- ✅ Set pricing and availability
- ✅ View active bookings
- ✅ Manage booking requests (approve/reject)
- ✅ Track rental income
- ✅ Receive notifications on new bookings

### **Admin Features**

- ✅ User management (view, deactivate, verify users)
- ✅ Property moderation
- ✅ Transaction monitoring
- ✅ Platform statistics and analytics
- ✅ Payment history tracking

---

## 🗄️ Database Schema

### **Tables**

#### **users**

```
id (PK)          - Unique user identifier
full_name        - User's full name
email (UNIQUE)   - Email address
password         - Hashed password
profile_photo    - Profile image URL
role             - User role (admin, owner, tenant)
is_verified      - Email verification status
is_active        - Account active status
created_at       - Registration timestamp
updated_at       - Last update timestamp
```

#### **rooms**

```
id (PK)          - Unique room identifier
owner_id (FK)    - Owner's user ID
title            - Room/property title
description      - Detailed description
address          - Physical address
location         - Location/area name
room_type        - Type (single, double, studio, etc.)
price            - Monthly rental price
bedrooms         - Number of bedrooms
bathrooms        - Number of bathrooms
area             - Room area in sq ft
amenities        - Comma-separated amenities list
main_image       - Primary image URL
is_available     - Availability status
created_at       - Listing timestamp
updated_at       - Last update timestamp
```

#### **room_images**

```
id (PK)          - Unique image identifier
room_id (FK)     - Associated room ID
image_url        - Image file URL
created_at       - Upload timestamp
```

#### **bookings**

```
id (PK)          - Unique booking identifier
room_id (FK)     - Room being booked
tenant_id (FK)   - Tenant's user ID
owner_id (FK)    - Owner's user ID
booking_date     - Date booking was made
move_in_date     - Tenant move-in date
move_out_date    - Tenant move-out date
status           - Booking status (pending_payment, pending, approved, rejected, cancelled, completed)
total_price      - Total rental amount
message          - Booking message/notes
created_at       - Booking creation timestamp
updated_at       - Last update timestamp
```

#### **khalti_payments**

```
id (PK)          - Unique payment record ID
booking_id (FK)  - Associated booking ID
tenant_id (FK)   - Tenant's user ID
room_id (FK)     - Room ID
amount           - Payment amount in NPR
payment_method   - Payment method (Khalti, etc.)
transaction_id   - Khalti transaction ID
pidx             - Khalti payment index
status           - Payment status (completed, pending, failed, etc.)
payment_date     - Payment timestamp
created_at       - Record creation timestamp
updated_at       - Last update timestamp
```

#### **notifications**

```
id (PK)          - Unique notification ID
user_id (FK)     - Recipient user ID
title            - Notification title
message          - Notification message
type             - Notification type (booking, payment, review, etc.)
is_read          - Read status
created_at       - Notification timestamp
```

#### **reviews**

```
id (PK)          - Unique review ID
room_id (FK)     - Reviewed room ID
tenant_id (FK)   - Reviewer's user ID
rating           - Rating (1-5 stars)
review_text      - Review comments
created_at       - Review timestamp
```

#### **favorites**

```
id (PK)          - Unique favorite ID
tenant_id (FK)   - Tenant's user ID
room_id (FK)     - Favorited room ID
created_at       - Added to favorites timestamp
```

---

## 💳 Payment Integration

### **Khalti Payment Gateway**

The platform uses **Khalti** for secure payment processing. Khalti is a widely-used mobile wallet and online payment solution in Nepal.

#### **Payment Flow**

1. Tenant selects booking dates and initiates booking
2. Booking created with status `pending_payment`
3. Khalti payment page is displayed
4. Tenant enters payment details (mobile wallet or card)
5. Khalti processes and confirms payment
6. Platform receives payment confirmation
7. Payment record saved to database
8. Booking status updated to `approved`
9. Owner receives notification
10. Tenant receives payment receipt
11. Receipt downloadable from Tenant Dashboard

#### **Khalti Configuration**

- **Public Key**: Used for frontend payment initiation
- **Secret Key**: Used for backend payment verification
- **Currency**: NPR (Nepalese Rupees)
- **Payment Methods**: Mobile wallet, debit card, credit card

#### **Payment Status Tracking**

- `pending` - Payment initiated but not completed
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Tenant cancelled payment

---

## 📁 Project Structure

```
rental-platform/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express application setup
│   │   ├── config/
│   │   │   └── database.js        # SQLite database configuration
│   │   ├── controllers/           # Business logic
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── roomController.js
│   │   │   ├── rentalController.js
│   │   │   ├── khaltiPaymentController.js
│   │   │   ├── notificationController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   ├── validation.js      # Request validation
│   │   │   └── upload.js          # File upload handling
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Room.js
│   │   ├── routes/                # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   ├── rentalRoutes.js
│   │   │   ├── khaltiPaymentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── uploads/               # Uploaded images storage
│   ├── server.js                  # Server entry point
│   ├── rental.db                  # SQLite database file
│   ├── rental.sqbpro              # SQLiteStudio project
│   ├── package.json
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css
│   │   ├── index.css              # Global styles
│   │   ├── assets/                # Images and static files
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── RoomForm.jsx
│   │   │   ├── RoomDetails.jsx
│   │   │   ├── OwnerLayout.jsx
│   │   │   ├── RentalHistory.jsx  # Tenant rental history
│   │   │   └── Receipts.jsx       # Payment receipts
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── BrowseRooms.jsx
│   │   │   ├── PaymentFailed.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── TenantDashboard.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js             # API configuration
│   │   │   └── authService.js     # Auth utilities
│   │   ├── styles/                # Component styles
│   │   ├── hooks/
│   │   │   └── useAuth.jsx        # Auth custom hook
│   │   ├── utils/                 # Utility functions
│   │   └── data/
│   │       └── mockData.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env
│
└── README.md (this file)
```

---

## 🚀 Installation & Setup

### **Prerequisites**

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### **Backend Setup**

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** in backend directory

   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   KHALTI_PUBLIC_KEY=your_khalti_public_key
   KHALTI_SECRET_KEY=your_khalti_secret_key
   ```

4. **Database initialization** - Automatically runs on server start
   - Tables created automatically
   - Initial test users seeded

### **Frontend Setup**

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** in frontend directory
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_KHALTI_PUBLIC_KEY=your_khalti_public_key
   ```

---

## ▶️ Running the Application

### **Start Backend Server**

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:5000`

### **Start Frontend Development Server**

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### **Build Frontend for Production**

```bash
cd frontend
npm run build
```

---

## 🔌 API Endpoints

### **Authentication** (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /verify-email/:token` - Email verification

### **Users** (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /all` - Get all users (admin only)
- `PUT /:id` - Update user (admin only)

### **Rooms** (`/api/rooms`)

- `GET /` - Get all available rooms
- `POST /` - Create new room (owner only)
- `GET /:id` - Get room details
- `PUT /:id` - Update room (owner only)
- `DELETE /:id` - Delete room (owner only)
- `GET /:id/images` - Get room images
- `POST /:id/favorite` - Add to favorites (tenant only)

### **Rentals/Bookings** (`/api/rentals`)

- `POST /` - Create booking (tenant only)
- `GET /my-bookings` - Get user's bookings
- `GET /:id` - Get booking details
- `PUT /:id/status` - Update booking status (owner only)

### **Payments** (`/api/payments`)

- `POST /initialize` - Initialize Khalti payment
- `POST /verify` - Verify payment with Khalti
- `GET /my-payments` - Get payment history (tenant only)
- `GET /` - Get all payments (admin only)

### **Notifications** (`/api/notifications`)

- `GET /` - Get user notifications
- `PUT /:id/read` - Mark as read

### **Admin** (`/api/admin`)

- `GET /stats` - Platform statistics
- `GET /users` - All users list
- `GET /rooms` - All rooms list
- `GET /payments` - All payments

---

## 👥 User Roles & Workflows

### **Tenant Workflow**

1. Sign up with email and password
2. Browse available rooms
3. View room details and images
4. Add rooms to favorites
5. Book room with move-in/move-out dates
6. Complete payment via Khalti
7. View booking confirmation
8. Download payment receipt
9. Access Tenant Dashboard
   - View rental history
   - Download/print receipts
10. Rate and review properties

### **Owner Workflow**

1. Sign up as property owner
2. Create room listings
   - Add title, description, address
   - Set price and availability
   - Upload multiple images
3. View Owner Dashboard
   - See active listings
   - Manage existing rooms
4. Receive booking notifications
5. Approve/reject booking requests
6. Track rental income

### **Admin Workflow**

1. Access Admin Dashboard
2. View platform statistics
3. Manage user accounts
4. Review room listings
5. Monitor payment transactions
6. Generate reports

---

## 🔐 Credentials

### **Test User Accounts** (Seeded on first run)

#### **Admin Account**

- **Email**: `admin@rental.com`
- **Password**: `admin123`
- **Role**: Admin

#### **Owner Account**

- **Email**: `owner@rental.com`
- **Password**: `owner123`
- **Role**: Owner

#### **Tenant Account**

- **Email**: `tenant@rental.com`
- **Password**: `tenant123`
- **Role**: Tenant

### **Khalti Payment** (Sandbox/Test Mode)

- **Test Mobile Number**: `981612345`
- **Test PIN**: `1234`
- **Test OTP**: `111111`
- **Sandbox URL**: `https://test-payment.khalti.com`

### **Environment Variables Required**

#### **Backend (.env)**

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
KHALTI_PUBLIC_KEY=test_public_key_from_khalti
KHALTI_SECRET_KEY=test_secret_key_from_khalti
KHALTI_API_URL=https://a.khalti.com/api
```

#### **Frontend (.env)**

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_KHALTI_PUBLIC_KEY=test_public_key_from_khalti
```

---

## 📝 Additional Information

### **Database File Location**

- Path: `backend/rental.db`
- Type: SQLite 3
- Size: Grows with user uploads

### **File Uploads**

- Directory: `backend/uploads/`
- Supported formats: JPG, JPEG, PNG
- Max file size: 5MB per image

### **Session Management**

- JWT tokens stored in localStorage (24 hours expiry)
- Automatic logout on token expiration

### **CORS Configuration**

- Frontend Origin: `http://localhost:5173`
- Backend allows cross-origin requests from frontend

---

## 📞 Support

For issues, questions, or contributions, please contact the development team.

**Last Updated**: March 31, 2026

---

**Happy Renting! 🏠**
