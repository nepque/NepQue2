import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as signInWithEmailPwd,
  signOut as firebaseSignOut,
  updateProfile,
  User,
  sendPasswordResetEmail,
  UserCredential
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Sign up with email/password
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up with email: ", error);
    throw error;
  }
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailPwd(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email: ", error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  user: User, 
  displayName?: string | null, 
  photoURL?: string | null
): Promise<void> => {
  try {
    await updateProfile(user, {
      displayName: displayName || undefined,
      photoURL: photoURL || undefined
    });
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// Get all users (for admin only) - requires Firebase Admin SDK
// Note: This is typically done on the server side with the Admin SDK
// We'll mock this for now, but in a real app you would use server endpoints
export const getAllUsers = async (): Promise<User[]> => {
  // In a real app, you would call a server endpoint that uses the Firebase Admin SDK
  throw new Error("This should be implemented on the server side with Firebase Admin SDK");
};

export { auth };