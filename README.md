# Mobile Shop ERP System

A full-stack Enterprise Resource Planning (ERP) application designed to manage mobile phone sales, repair services, inventory, customers, staff operations, and business activities from a centralized platform.

## Project Overview

Mobile Shop ERP helps mobile shops manage their daily operations efficiently through a centralized web application with role-based access control.

The project includes separate frontend and backend applications.

## Key Features

- Role-Based Access Control (RBAC)
- User management
- Customer management
- Product and category management
- Inventory management
- Repair management
- Repair status tracking
- SMS notifications using Twilio
- Staff attendance management
- GPS-based attendance verification
- Admin dashboard
- Search and pagination

## User Roles

- **Super Admin:** Manages the overall system and business operations.
- **Staff:** Accesses assigned operational features and activities.
- **Customer:** Accesses customer-related features.

## Technology Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Joi

### Integrations
- Twilio SMS
- Cloudinary

## Project Structure

```text
mobileshop-erp/
├── backend/
│   ├── src/
│   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mobileshop-erp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using the required environment variables.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create the required frontend environment file.

Start the frontend:

```bash
npm run dev
```

## Environment Configuration

Configure the required environment variables for:

- MongoDB connection
- JWT authentication
- Frontend URL
- Twilio credentials
- Cloudinary credentials
- Shop location and attendance radius

Never commit actual `.env` files or API secrets to GitHub.

## Development

The project follows a modular monolithic backend structure with separation of responsibilities across routes, controllers, services, repositories, models, middlewares, and configuration.

## Future Improvements

- Complete customer self-service features
- Enhanced reporting and analytics
- Additional inventory and sales reports
- Production deployment and monitoring

## Author

Developed as a full-stack Mobile Shop ERP project.
