import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// These should be in .env in a real app
const firebaseConfig = {
  apiKey: "AIzaSyCNIi4FNS5hzCuREiwaQJFd06aJQVQH7iA",
  authDomain: "mediflux-9f3f8.firebaseapp.com",
  projectId: "mediflux-9f3f8",
  storageBucket: "mediflux-9f3f8.firebasestorage.app",
  messagingSenderId: "396528222284",
  appId: "1:396528222284:web:435692dda51bc7ee1674e9"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
