# Applaudable - Digital Playbill Creator

A modern web application for creating and sharing digital playbills for theatrical performances, built with React and Firebase.

## Features

- Create beautiful digital playbills
- Google Authentication
- QR code generation for easy sharing
- Mobile-first responsive design
- Free and premium tiers

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Firebase project with:
  - Authentication (Google sign-in enabled)
  - Firestore Database
  - Storage

## Setup

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd applaudable-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and update the configuration in `src/firebase.js` with your Firebase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Project Structure

```
src/
├── components/     # Reusable components
├── contexts/      # React contexts (Auth, etc.)
├── pages/         # Page components
├── firebase.js    # Firebase configuration
└── App.jsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 