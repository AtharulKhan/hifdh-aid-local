// src/firebase-init.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";

// IMPORTANT: Replace with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // Ensure this is the RTDB URL
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get Auth and Database instances
const auth: Auth = getAuth(app);
const database: Database = getDatabase(app);

// Optional: Connect to Firebase emulators if you're using them for development
// Ensure this code only runs in a development environment
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  try {
    // Make sure emulators are running before connecting
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectDatabaseEmulator(database, "localhost", 9000); // RTDB default port
    console.log("Connected to Firebase Emulators");
  } catch (error) {
    console.error("Error connecting to Firebase Emulators: ", error);
  }
}

export { app, auth, database };
