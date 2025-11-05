import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	signInWithCredential,
	GoogleAuthProvider,
	User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import * as WebBrowser from 'expo-web-browser'
import * as Crypto from 'expo-crypto'

// Complete the Google OAuth flow
WebBrowser.maybeCompleteAuthSession()

export const signIn = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		return { user: userCredential.user, error: null }
	} catch (error: any) {
		return { user: null, error: error.message }
	}
}

export const signUp = async (email: string, password: string) => {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		return { user: userCredential.user, error: null }
	} catch (error: any) {
		return { user: null, error: error.message }
	}
}

export const signOutUser = async () => {
	try {
		await signOut(auth)
		return { error: null }
	} catch (error: any) {
		return { error: error.message }
	}
}

export const getCurrentUser = (): User | null => {
	return auth.currentUser
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
	return onAuthStateChanged(auth, callback)
}

/**
 * Sign in with Google
 * Note: You need to configure Google OAuth in Firebase Console and add the client IDs
 * Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment variables
 * Get this from Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
 */
export const signInWithGoogle = async () => {
	try {
		// Get the web client ID - this should be set in environment variables
		// You can find this in Firebase Console > Authentication > Sign-in method > Google
		const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
		
		if (!webClientId) {
			return { 
				user: null, 
				error: 'Google Web Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID' 
			}
		}

		// Create redirect URI
		const redirectUri = WebBrowser.makeRedirectUri({
			scheme: 'music-player',
			path: 'auth',
		})

		// Generate a random nonce for security
		const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		const nonce = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			randomString
		)

		// Build the Google OAuth URL
		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
			client_id: webClientId,
			redirect_uri: redirectUri,
			response_type: 'id_token',
			scope: 'openid profile email',
			nonce: nonce,
		}).toString()}`

		// Open the authentication session
		const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

		if (result.type === 'success' && result.url) {
			// Extract the ID token from the URL fragment
			const urlFragment = result.url.split('#')[1]
			if (urlFragment) {
				const params = new URLSearchParams(urlFragment)
				const idToken = params.get('id_token')

				if (idToken) {
					// Create a Google credential from the ID token
					const credential = GoogleAuthProvider.credential(idToken)
					
					// Sign in with Firebase using the credential
					const userCredential = await signInWithCredential(auth, credential)
					return { user: userCredential.user, error: null }
				}
			}
		}

		if (result.type === 'cancel') {
			return { user: null, error: 'Google sign-in was cancelled' }
		}

		return { user: null, error: 'Google sign-in failed' }
	} catch (error: any) {
		console.error('Google sign-in error:', error)
		return { user: null, error: error.message || 'Google sign-in failed' }
	}
}

