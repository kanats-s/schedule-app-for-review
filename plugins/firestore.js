import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const app = initializeApp({
  apiKey: '************',
  authDomain: '************',
  databaseURL: '************',
  projectId: '************',
  storageBucket: '************',
  messagingSenderId: '************',
  appId: '************',
  measurementId: '************'
});

export const db = getFirestore(app);