import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "./firebase.js";

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      idToken,
    };
  } catch (error) {
    console.error("Email Login Error:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      idToken,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export { auth, onAuthStateChanged };

