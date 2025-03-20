
# PurePath

PurePath is a web application designed to help users break free from unwanted habits like PMO and build a life of purpose through community support, guided meditations, and progress tracking.

## Tech Stack

This project is built with modern web technologies:

- [Vite](https://vitejs.dev/) - Fast, opinionated frontend build tool
- [React](https://reactjs.org/) - UI component library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [React Router](https://reactrouter.com/) - Client-side routing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Accessible UI components
- [Firebase](https://firebase.google.com/) - Authentication and backend services
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tanstack Query](https://tanstack.com/query) - Data fetching and state management
- [Recharts](https://recharts.org/) - Composable charting library

## Features

- 🔒 **Secure Authentication**: User account creation and login
- 📊 **Progress Analytics**: Track your journey with visual analytics
- 🧘 **Guided Meditations**: Access specialized meditations
- 🆘 **Emergency Support**: Panic button for immediate help
- 🌍 **Global Community**: Connect with others on the same journey
- 🔐 **Privacy-Focused**: All data is private and anonymized

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/purepath.git
   cd purepath
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Create a web app in your Firebase project
   - Copy the configuration values from your Firebase project settings
   
4. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
   ```

   You can use the `.env.sample` file as a template.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open your browser and navigate to `http://localhost:8080`

### Setting Up Admin Access

PurePath includes an admin dashboard for managing users, content, and moderation. To set up admin access:

1. Register a user account with the email that should have admin privileges
2. You can set up admin access in one of two ways:
   - **Option 1**: Use the Firestore Admin console to create an "admins" collection and add a document called "authorized_emails" with an array field named "emails" that includes the admin email(s)
   - **Option 2**: For first-time setup, the application will automatically recognize the predefined admin email(s)

3. When logged in as an admin, you can access the admin dashboard at `/admin`

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Project Structure

```
purepath/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── utils/          # Helper functions and Firebase setup
│   ├── App.tsx         # Main App component with routing
│   └── main.tsx        # Entry point
├── .env.sample         # Sample environment variables
└── README.md           # Project documentation
```

## Authentication

This application uses Firebase Authentication for user management. Users can:
- Register with email and password
- Log in with existing credentials
- Access protected routes (dashboard, profile, etc.)
- Admin users have access to additional features and the admin dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
