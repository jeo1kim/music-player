import { Stack } from 'expo-router'
import { colors } from '@/constants/tokens'

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.background,
				},
				headerTitleStyle: {
					color: colors.text,
				},
				headerTintColor: colors.text,
			}}
		>
			<Stack.Screen
				name="login"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	)
}

