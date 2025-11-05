import {
	collection,
	doc,
	getDocs,
	updateDoc,
	setDoc,
	query,
	where,
	DocumentData,
} from 'firebase/firestore'
import { db, storage } from '@/config/firebase'
import { TrackWithPlaylist } from '@/helpers/types'
import { ref, getDownloadURL } from 'firebase/storage'

const COLLECTION_NAME = 'tracks'

/**
 * Fetch all tracks from the shared library
 */
export const fetchTracks = async (): Promise<TrackWithPlaylist[]> => {
	try {
		const tracksRef = collection(db, COLLECTION_NAME)
		const querySnapshot = await getDocs(tracksRef)

		const tracks: TrackWithPlaylist[] = []

		for (const docSnapshot of querySnapshot.docs) {
			const data = docSnapshot.data()
			
			// Convert Firebase Storage path to download URL if needed
			let url = data.url
			if (url && (url.startsWith('gs://') || url.startsWith('/'))) {
				// If it's a gs:// URL or storage path, convert to download URL
				try {
					// Extract the path from gs:// URL or use as-is if it's already a path
					const path = url.startsWith('gs://')
						? url.replace('gs://', '').replace(/^[^/]+\//, '')
						: url.startsWith('/')
						? url.slice(1)
						: url
					const storageRef = ref(storage, path)
					url = await getDownloadURL(storageRef)
				} catch (error) {
					console.error('Error converting storage URL:', error)
					// Keep the original URL if conversion fails
				}
			}

			const track: TrackWithPlaylist = {
				id: docSnapshot.id,
				url: url || data.url,
				title: data.title || '',
				artist: data.artist || '',
				artwork: data.artwork || '',
				rating: data.rating || 0,
				playlist: data.playlist || [],
				// Include any other track fields
				duration: data.duration,
				album: data.album,
			}

			tracks.push(track)
		}

		return tracks
	} catch (error) {
		console.error('Error fetching tracks:', error)
		throw error
	}
}

/**
 * Update a track document in Firestore (shared collection)
 */
export const updateTrack = async (
	trackId: string,
	updates: Partial<TrackWithPlaylist>
): Promise<void> => {
	try {
		const trackRef = doc(db, COLLECTION_NAME, trackId)
		await updateDoc(trackRef, updates)
	} catch (error) {
		console.error('Error updating track:', error)
		throw error
	}
}

/**
 * Set a track document in Firestore (creates if doesn't exist) - shared collection
 */
export const setTrack = async (
	trackId: string,
	trackData: Partial<TrackWithPlaylist>
): Promise<void> => {
	try {
		const trackRef = doc(db, COLLECTION_NAME, trackId)
		await setDoc(trackRef, trackData, { merge: true })
	} catch (error) {
		console.error('Error setting track:', error)
		throw error
	}
}

/**
 * Find track ID by URL (since we use URL as unique identifier) - shared collection
 */
export const findTrackIdByUrl = async (url: string): Promise<string | null> => {
	try {
		const tracksRef = collection(db, COLLECTION_NAME)
		const q = query(tracksRef, where('url', '==', url))
		const querySnapshot = await getDocs(q)

		if (!querySnapshot.empty) {
			return querySnapshot.docs[0].id
		}

		return null
	} catch (error) {
		console.error('Error finding track by URL:', error)
		return null
	}
}

// Keep backward compatibility
export const fetchUserTracks = fetchTracks

