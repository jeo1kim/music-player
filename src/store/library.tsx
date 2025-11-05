import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { fetchTracks, findTrackIdByUrl } from '@/services/firestore'

interface LibraryState {
	tracks: TrackWithPlaylist[]
	isLoading: boolean
	error: string | null
	syncTracksFromFirebase: () => Promise<void>
	refreshTracks: () => Promise<void>
	toggleTrackFavorite: (track: Track) => Promise<void>
	addToPlaylist: (track: Track, playlistName: string) => Promise<void>
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
	tracks: [],
	isLoading: false,
	error: null,
	syncTracksFromFirebase: async () => {
		set({ isLoading: true, error: null })
		try {
			const tracks = await fetchTracks()
			set({ tracks, isLoading: false, error: null })
		} catch (error: any) {
			console.error('Error syncing tracks:', error)
			set({ error: error.message || 'Failed to sync tracks', isLoading: false })
		}
	},
	refreshTracks: async () => {
		await get().syncTracksFromFirebase()
	},
	toggleTrackFavorite: async (track) => {
		const currentTrack = get().tracks.find((t) => t.url === track.url)
		if (!currentTrack) return

		const newRating = currentTrack.rating === 1 ? 0 : 1
		
		// Update local state only (favorites are per-user, stored locally)
		// For a shared library, we don't sync favorites to Firestore
		set((state) => ({
			tracks: state.tracks.map((currentTrack) => {
				if (currentTrack.url === track.url) {
					return {
						...currentTrack,
						rating: newRating,
					}
				}
				return currentTrack
			}),
		}))
	},
	addToPlaylist: async (track, playlistName) => {
		const currentTrack = get().tracks.find((t) => t.url === track.url)
		if (!currentTrack) return

		// Check if already in playlist
		if (currentTrack.playlist?.includes(playlistName)) return

		const newPlaylist = [...(currentTrack.playlist ?? []), playlistName]

		// Update local state only (playlists are per-user, stored locally)
		// For a shared library, we don't sync playlists to Firestore
		set((state) => ({
			tracks: state.tracks.map((currentTrack) => {
				if (currentTrack.url === track.url) {
					return {
						...currentTrack,
						playlist: newPlaylist,
					}
				}
				return currentTrack
			}),
		}))
	},
}))

export const useTracks = () => useLibraryStore((state) => state.tracks)

export const useFavorites = () => {
	const favorites = useLibraryStore((state) => state.tracks.filter((track) => track.rating === 1))
	const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite)

	return {
		favorites,
		toggleTrackFavorite,
	}
}

export const useArtists = () =>
	useLibraryStore((state) => {
		return state.tracks.reduce((acc, track) => {
			const existingArtist = acc.find((artist) => artist.name === track.artist)

			if (existingArtist) {
				existingArtist.tracks.push(track)
			} else {
				acc.push({
					name: track.artist ?? 'Unknown',
					tracks: [track],
				})
			}

			return acc
		}, [] as Artist[])
	})

export const usePlaylists = () => {
	const playlists = useLibraryStore((state) => {
		return state.tracks.reduce((acc, track) => {
			track.playlist?.forEach((playlistName) => {
				const existingPlaylist = acc.find((playlist) => playlist.name === playlistName)

				if (existingPlaylist) {
					existingPlaylist.tracks.push(track)
				} else {
					acc.push({
						name: playlistName,
						tracks: [track],
						artworkPreview: track.artwork ?? unknownTrackImageUri,
					})
				}
			})

			return acc
		}, [] as Playlist[])
	})

	const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)

	return { playlists, addToPlaylist }
}
