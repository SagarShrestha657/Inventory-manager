# Inventory Manager

A full-stack web application designed to help users manage their inventory, track products, analyze sales data, and set goals.

## Features

- **Secure User Authentication:** A complete authentication system featuring user registration with email-based OTP verification, secure login using JWT (JSON Web Tokens), and a "Forgot Password" flow that enables users to reset their password securely.

- **Interactive Dashboard:** A central landing page that provides an at-a-glance overview of the inventory, including key statistics, recent activity, and quick navigation to all major sections of the application.

- **Comprehensive Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for inventory items. Users can add new products with details like name, category, price, and quantity, edit existing items, and view detailed product information in a clean, organized table. Includes functionality to adjust stock levels up or down.

- **Dynamic Category Management:** Ability to create, edit, and delete custom product categories, allowing for better organization and filtering of the inventory.

- **Insightful Analytics & Goal Setting:** A dedicated analytics page to visualize inventory data (e.g., stock levels, product values). Users can set financial or stock-related goals and track their progress over time.

- **Detailed Inventory History:** A complete audit trail of all changes made to the inventory. This includes a log of when products were added, edited, or had their stock adjusted, providing full traceability.

- **User Profile & Account Settings:** A secure settings page where users can manage their profile, including changing their username and password. It also provides a secure option for users to permanently delete their account.

## Tech Stack

### Backend
- **Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Email:** Nodemailer for transactional emails
- **Other:** `dotenv`, `bcryptjs`, `cors`

### Frontend
- **Framework:** React with Vite
-- **Language:** TypeScript
- **Styling:** Material-UI and Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query & Axios
- **Routing:** React Router

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (or a compatible package manager like bun or yarn)
- Git
- MongoDB (a local instance or a cloud-hosted one like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd Inventory-manager
    ```

2.  **Set up the Backend:**
    - Navigate to the backend directory:
      ```bash
      cd Backend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `Backend` directory by copying the `.env.example` or creating a new one. Fill it with the following variables:
      ```env
      # Server Configuration
      PORT=5000
      FRONTEND_URL=http://localhost:5173

      # MongoDB Connection
      MONGODB_URI=<your_mongodb_connection_string>

      # JWT Secret
      JWT_SECRET=<your_strong_jwt_secret>

      # Email (SMTP) Configuration for Nodemailer
      SMTP_HOST=smtp.example.com
      SMTP_PORT=587
      SMTP_SECURE=false # true for 465, false for other ports
      SMTP_USER=<your_smtp_username>
      SMTP_PASSWORD=<your_smtp_password>
      EMAIL_FROM="Inventory Manager" <noreply@example.com>
      ```
    - Start the development server:
      ```bash
      npm run dev
      ```
    - The backend server will be running on the port specified in your `.env` file (e.g., `http://localhost:5000`).

3.  **Set up the Frontend:**
    - Open a new terminal and navigate to the frontend directory:
      ```bash
      cd Frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Start the development server:
      ```bash
      npm run dev
      ```
    - The frontend development server will start, and you can access the application in your browser, typically at `http://localhost:5173`.

## Project Structure

```
.
├── Backend/      # Node.js, Express, TypeScript API
│   ├── src/
│   ├── package.json
│   └── ...
└── Frontend/     # React, Vite, TypeScript UI
    ├── src/
    ├── package.json
    └── ...
```

- The **`Backend`** directory contains the server-side code, including API routes, controllers, models, and middleware.
- The **`Frontend`** directory contains the client-side React application, including pages, components, services, and state management stores.
