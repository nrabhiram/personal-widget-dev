import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, initializeFirestore, FirestoreSettings } from 'firebase/firestore';
// Removed analytics import to avoid initialization issues
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDxsSRpmQUt41Q_JmPEcbAPgQzUrUNXV6Q",
  authDomain: "profootballnetwork-8e365.firebaseapp.com",
  projectId: "profootballnetwork-8e365",
  storageBucket: "profootballnetwork-8e365.appspot.com",
  messagingSenderId: "317914786543",
  appId: "1:317914786543:web:e93f8a514cbbc1e761491a",
  measurementId: "G-HZWEW0N3E8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database
const firestoreSettings: FirestoreSettings = {
  ignoreUndefinedProperties: true
};

export const db = getFirestore(app, 'leaderboards');
export const auth = getAuth(app);

export default app;
