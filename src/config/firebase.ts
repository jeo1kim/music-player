import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { initializeAuth, getAuth, getReactNativePersistence, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Firebase configuration - these should be set via environment variables
// For production, use expo-constants to get these from app.json or .env
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
}

// Initialize Firebase only if it hasn't been initialized yet
let app: FirebaseApp
if (getApps().length === 0) {
	app = initializeApp(firebaseConfig)
} else {
	app = getApps()[0]
}

// Initialize Firebase Auth with AsyncStorage persistence
// Check if auth is already initialized to avoid "already initialized" error
let auth: Auth
try {
	// Try to initialize with AsyncStorage persistence
	auth = initializeAuth(app, {
		persistence: getReactNativePersistence(AsyncStorage),
	})
} catch (error: any) {
	// If auth is already initialized, just get the existing instance
	if (error?.code === 'auth/already-initialized') {
		auth = getAuth(app)
	} else {
		throw error
	}
}

export { auth }
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)

export default app

