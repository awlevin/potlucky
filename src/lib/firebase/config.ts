// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";

// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const analytics = getAnalytics(app);

import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const db = getFirestore(firebaseApp);

// Local development: point the SDK at the Firestore emulator
// (`yarn emulators`) when NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST is set.
const emulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
const emulatorFlag = "__potluckyFirestoreEmulatorConnected";
if (emulatorHost && !(globalThis as Record<string, unknown>)[emulatorFlag]) {
  const [host, port] = emulatorHost.split(":");
  connectFirestoreEmulator(db, host, Number(port || 8080));
  (globalThis as Record<string, unknown>)[emulatorFlag] = true;
}

export default firebaseApp;
export { db }
