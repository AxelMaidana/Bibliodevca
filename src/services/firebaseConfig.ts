import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyDTTqXxo2mkE4iVRpMjwew2fl0oEG2PEW0',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'colegio-enfermeria.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://colegio-enfermeria-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'colegio-enfermeria',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'colegio-enfermeria.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '611697437358',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:611697437358:web:b6d3402e9198cf793d5b3f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-M7WLFWJJRF',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
