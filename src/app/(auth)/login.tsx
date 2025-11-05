import { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import { signIn, signUp, signInWithGoogle } from '@/services/auth'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { defaultStyles } from '@/styles'

export default function LoginScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSignUp, setIsSignUp] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

	const handleAuth = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Please enter both email and password')
			return
		}

		if (password.length < 6) {
			Alert.alert('Error', 'Password must be at least 6 characters')
			return
		}

		setIsLoading(true)
		try {
			const result = isSignUp ? await signUp(email, password) : await signIn(email, password)
			
			if (result.error) {
				Alert.alert('Error', result.error)
			}
			// If successful, the auth state change will trigger navigation
		} catch (error: any) {
			Alert.alert('Error', error.message || 'An error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true)
		try {
			const result = await signInWithGoogle()
			
			if (result.error) {
				Alert.alert('Error', result.error)
			}
			// If successful, the auth state change will trigger navigation
		} catch (error: any) {
			Alert.alert('Error', error.message || 'An error occurred')
		} finally {
			setIsGoogleLoading(false)
		}
	}

	return (
		<KeyboardAvoidingView
			style={[defaultStyles.container, { justifyContent: 'center', padding: screenPadding.horizontal }]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={{ gap: 20 }}>
				<Text
					style={{
						fontSize: fontSize.lg,
						color: colors.text,
						textAlign: 'center',
						marginBottom: 20,
						fontWeight: 'bold',
					}}
				>
					{isSignUp ? 'Create Account' : 'Welcome Back'}
				</Text>

				<TextInput
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						color: colors.text,
						padding: 16,
						borderRadius: 8,
						fontSize: fontSize.sm,
					}}
					placeholder="Email"
					placeholderTextColor={colors.textMuted}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					autoComplete="email"
				/>

				<TextInput
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						color: colors.text,
						padding: 16,
						borderRadius: 8,
						fontSize: fontSize.sm,
					}}
					placeholder="Password"
					placeholderTextColor={colors.textMuted}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoCapitalize="none"
					autoComplete="password"
				/>

				<TouchableOpacity
					style={{
						backgroundColor: colors.primary,
						padding: 16,
						borderRadius: 8,
						alignItems: 'center',
						marginTop: 10,
					}}
					onPress={handleAuth}
					disabled={isLoading || isGoogleLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={colors.text} />
					) : (
						<Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: '600' }}>
							{isSignUp ? 'Sign Up' : 'Sign In'}
						</Text>
					)}
				</TouchableOpacity>

				<View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
					<View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
					<Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginHorizontal: 10 }}>
						OR
					</Text>
					<View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
				</View>

				<TouchableOpacity
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						padding: 16,
						borderRadius: 8,
						alignItems: 'center',
						flexDirection: 'row',
						justifyContent: 'center',
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.2)',
					}}
					onPress={handleGoogleSignIn}
					disabled={isLoading || isGoogleLoading}
				>
					{isGoogleLoading ? (
						<ActivityIndicator color={colors.text} />
					) : (
						<>
							<Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: '600', marginLeft: 8 }}>
								Continue with Google
							</Text>
						</>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => setIsSignUp(!isSignUp)}
					style={{ alignItems: 'center', marginTop: 10 }}
				>
					<Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
						{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	)
}

