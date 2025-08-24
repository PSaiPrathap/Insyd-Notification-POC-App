# Insyd Notification POC App

## Description
The Insyd Notification POC App is a proof-of-concept application designed to demonstrate a notification system. It consists of a frontend built with React and a backend powered by Express.js, allowing users to receive notifications based on various events.

## Getting Started
To get started with the project, clone the repository and install the necessary dependencies for both the frontend and backend.

### Frontend
    1. Navigate to the `insyd-notification-frontend` directory.
    2. Run `npm install` to install the frontend dependencies.
    3. Start the development server with `npm start`.
    4. Open http://localhost:3000 in your browser to view the app.

### Backend
    1. Navigate to the `insyd-notification-backend` directory.
    2. Run `npm install` to install the backend dependencies.
    3. Start the backend server with `node server.js`.
    4. The backend will run on http://localhost:5000.

## Frontend
The frontend is built using Create React App and includes several components:
- **EventTrigger**: Component responsible for triggering events.
- **NotificationList**: Displays a list of notifications for the user.
- **UserList**: Shows a list of users in the system.

## Backend
The backend is built with Express.js and provides the following API endpoints:
- **POST /events**: Create an event.
- **GET /notifications/:userId**: Retrieve notifications for a specific user.
- **POST /notifications**: Manually create a notification (for testing).
- **POST /users**: Create a new user.
- **GET /users**: Retrieve a list of users.

## Database
The application uses SQLite for data storage, managing events and notifications efficiently.
