// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { GAME_EVENTS } from '@/utils';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Dispatch auth state change event
      window.dispatchEvent(
        new CustomEvent(GAME_EVENTS.AUTH_STATE_CHANGED, {
          detail: {
            user: user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            } : null
          }
        })
      );
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await result.user.reload();
    return auth.currentUser || result.user;
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
};
