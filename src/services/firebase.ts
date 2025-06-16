
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";

// Using the same Firebase config from your existing setup
const firebaseConfig = {
  apiKey: "AIzaSyAgjN-hsjUy4Ir3jmK-oh7-dsconPaTdgw",
  authDomain: "hifdh-aid.firebaseapp.com",
  databaseURL: "https://hifdh-aid-default-rtdb.firebaseio.com/",
  projectId: "hifdh-aid",
  storageBucket: "hifdh-aid.firebasestorage.app",
  messagingSenderId: "840898828694",
  measurementId: "G-NHE6J2680F",
  appId: "1:840898828694:web:002424d8790489835625b7"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get Auth and Database instances
export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);

// Optional: Connect to Firebase emulators in development
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectDatabaseEmulator(database, "localhost", 9000);
    console.log("Connected to Firebase Emulators");
  } catch (error) {
    console.log("Firebase Emulators not available or already connected");
  }
}

export { app };
