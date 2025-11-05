import { StackScreenWithSearchBar } from '@/constants/layout'
import { defaultStyles } from '@/styles'
import { Stack, useRouter } from 'expo-router'
import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/tokens'
import { getCurrentUser } from '@/services/auth'

const SongsScreenLayout = () => {
	const router = useRouter()
	const user = getCurrentUser()

	return (
		<View style={defaultStyles.container}>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						...StackScreenWithSearchBar,
						headerTitle: 'Songs',
						headerRight: () => (
							<TouchableOpacity
								onPress={() => router.push('/(modals)/login')}
								style={{ marginRight: 16 }}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Ionicons
									name={user ? 'person-circle' : 'person-circle-outline'}
									size={28}
									color={user ? colors.primary : colors.text}
								/>
							</TouchableOpacity>
						),
					}}
				/>
			</Stack>
		</View>
	)
}

export default SongsScreenLayout
