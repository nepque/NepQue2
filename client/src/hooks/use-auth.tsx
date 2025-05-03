import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { createRoot } from "react-dom/client";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  onAuthStateChange,
  updateUserProfile
} from "@/lib/firebase";
import BannedUserNotification from "@/components/BannedUserNotification";

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
  "test@example.com", // Added for testing purposes
  // Any email can be added here for testing
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
      
      // Check for banned status
      if (response.status === 403) {
        const data = await response.json();
        if (data.banned) {
          console.error('User is banned from the platform');
          
          // Sign out the user immediately
          await signOut();
          
          // Show banned user notification
          showBannedUserNotification();
          
          return false;
        }
      }
      
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
      
      return true;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      return false;
    }
  };
  
  // Function to show banned user notification
  const showBannedUserNotification = () => {
    // Create container for notification
    const container = document.createElement('div');
    container.id = 'banned-user-notification';
    document.body.appendChild(container);
    
    // Render notification component
    const root = createRoot(container);
    root.render(
      <BannedUserNotification 
        onClose={() => {
          root.unmount();
          container.remove();
        }} 
      />
    );
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // Check if user is banned before setting current user
        const userAllowed = await ensureUserExists(user);
        if (userAllowed) {
          setCurrentUser(user);
        } else {
          // If user is banned, set current user to null
          setCurrentUser(null);
        }
      } else {
        // No user is signed in
        setCurrentUser(null);
      }
      
      setLoading(false);
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