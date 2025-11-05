import { playbackService } from '@/constants/playbackService'
import { colors } from '@/constants/tokens'
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState'
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { useLibraryStore } from '@/store/library'

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => playbackService)

const App = () => {
	const [isInitializing, setIsInitializing] = useState(true)
	const { syncTracksFromFirebase } = useLibraryStore()

	// Sync tracks on app launch (no auth required for shared library)
	useEffect(() => {
		setIsInitializing(false)
		// Sync tracks immediately - shared library doesn't require auth
		syncTracksFromFirebase().catch((error) => {
			console.error('Error syncing tracks on launch:', error)
			// Don't block app load if sync fails
		})
	}, [syncTracksFromFirebase])

	const handleTrackPlayerLoaded = useCallback(() => {
		console.log('TrackPlayer loaded, hiding splash screen')
		SplashScreen.hideAsync()
	}, [])

	// Fallback: Hide splash screen after a timeout to prevent stuck screen
	useEffect(() => {
		const timeout = setTimeout(() => {
			console.log('Fallback: Hiding splash screen after timeout')
			SplashScreen.hideAsync()
		}, 3000) // 3 second fallback - ensures splash always hides

		return () => clearTimeout(timeout)
	}, [])

	useSetupTrackPlayer({
		onLoad: handleTrackPlayerLoaded,
	})

	useLogTrackPlayerState()

	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<RootNavigation />

				<StatusBar style="auto" />
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

const RootNavigation = () => {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />

			<Stack.Screen
				name="player"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					gestureDirection: 'vertical',
					animationDuration: 400,
					headerShown: false,
				}}
			/>

			<Stack.Screen
				name="(modals)/addToPlaylist"
				options={{
					presentation: 'modal',
					headerStyle: {
						backgroundColor: colors.background,
					},
					headerTitle: 'Add to playlist',
					headerTitleStyle: {
						color: colors.text,
					},
				}}
			/>

			<Stack.Screen
				name="(modals)/login"
				options={{
					presentation: 'transparentModal',
					headerShown: false,
					animation: 'slide_from_bottom',
				}}
			/>
		</Stack>
	)
}

export default App
