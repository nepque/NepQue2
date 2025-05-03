import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  onAuthStateChange,
  updateUserProfile
} from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  updateProfile: (displayName?: string | null, photoURL?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// List of admin emails - in a real app, this would be stored on the server side
const ADMIN_EMAILS = [
  "admin@couponhub.com",
  // Add other admin emails here
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Update admin status whenever the user changes
  useEffect(() => {
    if (currentUser?.email) {
      setIsAdmin(ADMIN_EMAILS.includes(currentUser.email));
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  // Ensure user exists in our database when they authenticate
  const ensureUserExists = async (user: User) => {
    try {
      // First try to get the user
      const response = await fetch(`/api/users/${user.uid}`);
      
      // If user doesn't exist, create them
      if (response.status === 404) {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
          }),
        });
        console.log('Created new user in database');
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Ensure the user exists in our database
        ensureUserExists(user);
      }
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const handleSignInWithGoogle = async () => {
    try {
      return await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign in with email/password
  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      return await signInWithEmail(email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  // Sign up with email/password
  const handleSignUpWithEmail = async (email: string, password: string) => {
    try {
      return await signUpWithEmail(email, password);
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  // Update profile
  const handleUpdateProfile = async (displayName?: string | null, photoURL?: string | null) => {
    if (!currentUser) {
      throw new Error("No user is signed in");
    }
    
    try {
      await updateUserProfile(currentUser, displayName, photoURL);
      // Force refresh the user - ensure values are not undefined
      setCurrentUser({
        ...currentUser, 
        displayName: displayName === undefined ? currentUser.displayName : displayName,
        photoURL: photoURL === undefined ? currentUser.photoURL : photoURL
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    updateProfile: handleUpdateProfile,
    signOut: handleSignOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}