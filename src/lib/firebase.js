
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: "sofwipad-erp-contable.firebaseapp.com",
  projectId: "sofwipad-erp-contable",
  storageBucket: "sofwipad-erp-contable.appspot.com",
  messagingSenderId: "902895181248",
  appId: "1:902895181248:web:dfb884b039dedacfb3bc25",
  measurementId: "G-D22KTMEDP6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel("debug");

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
  logEvent(analytics, "app_start", {
    app: "ERP Contable",
    time: new Date().toISOString(),
  });
}

export { app, auth, db, analytics };

// Re-exporting firebase functions for convenience
export {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

export {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  getDocs,
  limit,
  increment,
  orderBy,
} from "firebase/firestore";
