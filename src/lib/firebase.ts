import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase is a client-only concern here (no backend, per design) — it must
// never initialize during Next.js's server-side static export prerendering,
// where these env vars may be absent or a Firebase project misconfiguration
// would otherwise fail the ENTIRE site build, not just the /beheer pages.
function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const auth: Auth = typeof window !== 'undefined' ? getAuth(getFirebaseApp()) : ({} as Auth);
export const db: Firestore =
  typeof window !== 'undefined' ? getFirestore(getFirebaseApp()) : ({} as Firestore);
