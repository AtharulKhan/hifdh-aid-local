// src/auth-service.ts
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { auth } from './firebase-init'; // Assuming auth is exported from firebase-init.ts

class AuthService {
  private authInstance: Auth;

  constructor() {
    this.authInstance = auth;
  }

  async registerWithEmailPassword(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.authInstance, email, password);
      console.log('User registered:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error("Error registering user:", error.message);
      // Handle specific errors like 'auth/email-already-in-use'
      return null;
    }
  }

  async signInWithEmailPassword(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.authInstance, email, password);
      console.log('User signed in:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in user:", error.message);
      // Handle specific errors like 'auth/user-not-found' or 'auth/wrong-password'
      return null;
    }
  }

  async signOutUser(): Promise<void> {
    try {
      await signOut(this.authInstance);
      console.log('User signed out.');
    } catch (error: any) {
      console.error("Error signing out user:", error.message);
    }
  }

  getCurrentUser(): User | null {
    return this.authInstance.currentUser;
  }
}

export const authService = new AuthService();
