import { useEffect, useRef } from 'react'
import TrackPlayer, { Capability, RatingType, RepeatMode } from 'react-native-track-player'

// Global flag to prevent multiple initializations
let isPlayerInitialized = false

const setupPlayer = async () => {
	// Check if already initialized
	if (isPlayerInitialized) {
		return
	}

	try {
		await TrackPlayer.setupPlayer({
			maxCacheSize: 1024 * 10,
		})

		await TrackPlayer.updateOptions({
			ratingType: RatingType.Heart,
			capabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
				Capability.Stop,
			],
		})

		await TrackPlayer.setVolume(0.3) // not too loud
		await TrackPlayer.setRepeatMode(RepeatMode.Queue)
		
		isPlayerInitialized = true
	} catch (error: any) {
		// If error is about already being initialized, mark as initialized
		if (error?.message?.includes('already been initialized')) {
			isPlayerInitialized = true
			// Still update options and settings
			await TrackPlayer.updateOptions({
				ratingType: RatingType.Heart,
				capabilities: [
					Capability.Play,
					Capability.Pause,
					Capability.SkipToNext,
					Capability.SkipToPrevious,
					Capability.Stop,
				],
			})
			await TrackPlayer.setVolume(0.3)
			await TrackPlayer.setRepeatMode(RepeatMode.Queue)
		} else {
			throw error
		}
	}
}

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
	const hasCalledOnLoad = useRef(false)

	useEffect(() => {
		if (hasCalledOnLoad.current && isPlayerInitialized) return

		setupPlayer()
			.then(() => {
				if (!hasCalledOnLoad.current) {
					hasCalledOnLoad.current = true
					onLoad?.()
				}
			})
			.catch((error) => {
				// If already initialized, still call onLoad
				if (error?.message?.includes('already been initialized') || isPlayerInitialized) {
					if (!hasCalledOnLoad.current) {
						hasCalledOnLoad.current = true
						onLoad?.()
					}
				} else {
					console.error('Error setting up TrackPlayer:', error)
				}
			})
		// Remove onLoad from dependencies to prevent re-runs
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
