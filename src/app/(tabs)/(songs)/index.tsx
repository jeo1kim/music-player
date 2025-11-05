import { TracksList } from '@/components/TracksList'
import { screenPadding, colors } from '@/constants/tokens'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/miscellaneous'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useTracks, useLibraryStore } from '@/store/library'
import { defaultStyles } from '@/styles'
import { useMemo, useState } from 'react'
import { ScrollView, View, RefreshControl } from 'react-native'

const SongsScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in songs',
		},
	})

	const tracks = useTracks()
	const { refreshTracks, isLoading } = useLibraryStore()
	const [refreshing, setRefreshing] = useState(false)

	const filteredTracks = useMemo(() => {
		if (!search) return tracks

		return tracks.filter(trackTitleFilter(search))
	}, [search, tracks])

	const onRefresh = async () => {
		setRefreshing(true)
		try {
			await refreshTracks()
		} finally {
			setRefreshing(false)
		}
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing || isLoading}
						onRefresh={onRefresh}
						tintColor={colors.primary}
					/>
				}
			>
				<TracksList
					id={generateTracksListId('songs', search)}
					tracks={filteredTracks}
					scrollEnabled={false}
				/>
			</ScrollView>
		</View>
	)
}

export default SongsScreen
