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
	StyleSheet,
	Pressable,
} from 'react-native'
import { signIn, signUp, signInWithGoogle, getCurrentUser } from '@/services/auth'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'

export default function LoginModal() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSignUp, setIsSignUp] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const user = getCurrentUser()

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
			} else {
				// Close modal on success
				router.dismiss()
			}
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
			} else {
				// Close modal on success
				router.dismiss()
			}
		} catch (error: any) {
			Alert.alert('Error', error.message || 'An error occurred')
		} finally {
			setIsGoogleLoading(false)
		}
	}

	const handleSignOut = async () => {
		const { signOutUser } = await import('@/services/auth')
		await signOutUser()
		router.dismiss()
	}

	return (
		<View style={styles.overlay}>
			<Pressable style={styles.backdrop} onPress={() => router.dismiss()} />
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<BlurView intensity={95} style={styles.blurContainer}>
					<SafeAreaView edges={['bottom']} style={styles.content}>
						{/* Handle bar */}
						<View style={styles.handleBar} />

						{/* Close button */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => router.dismiss()}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="close" size={24} color={colors.text} />
						</TouchableOpacity>

						{user ? (
							<View style={styles.signedInContainer}>
								<Text style={styles.title}>Signed in as</Text>
								<Text style={styles.userEmail}>{user.email}</Text>
								<TouchableOpacity
									style={[styles.button, styles.signOutButton]}
									onPress={handleSignOut}
								>
									<Text style={styles.buttonText}>Sign Out</Text>
								</TouchableOpacity>
							</View>
						) : (
							<View style={styles.authContainer}>
								<Text style={styles.title}>
									{isSignUp ? 'Create Account' : 'Welcome Back'}
								</Text>

								<TextInput
									style={styles.input}
									placeholder="Email"
									placeholderTextColor={colors.textMuted}
									value={email}
									onChangeText={setEmail}
									autoCapitalize="none"
									keyboardType="email-address"
									autoComplete="email"
								/>

								<TextInput
									style={styles.input}
									placeholder="Password"
									placeholderTextColor={colors.textMuted}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
									autoCapitalize="none"
									autoComplete="password"
								/>

								<TouchableOpacity
									style={[styles.button, styles.primaryButton]}
									onPress={handleAuth}
									disabled={isLoading || isGoogleLoading}
								>
									{isLoading ? (
										<ActivityIndicator color={colors.text} />
									) : (
										<Text style={styles.buttonText}>
											{isSignUp ? 'Sign Up' : 'Sign In'}
										</Text>
									)}
								</TouchableOpacity>

								<View style={styles.divider}>
									<View style={styles.dividerLine} />
									<Text style={styles.dividerText}>OR</Text>
									<View style={styles.dividerLine} />
								</View>

								<TouchableOpacity
									style={[styles.button, styles.googleButton]}
									onPress={handleGoogleSignIn}
									disabled={isLoading || isGoogleLoading}
								>
									{isGoogleLoading ? (
										<ActivityIndicator color={colors.text} />
									) : (
										<Text style={styles.buttonText}>Continue with Google</Text>
									)}
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => setIsSignUp(!isSignUp)}
									style={styles.switchMode}
								>
									<Text style={styles.switchModeText}>
										{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</SafeAreaView>
				</BlurView>
			</KeyboardAvoidingView>
		</View>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	blurContainer: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		overflow: 'hidden',
		maxHeight: '80%',
	},
	content: {
		paddingHorizontal: screenPadding.horizontal,
		paddingBottom: 20,
		paddingTop: 10,
	},
	handleBar: {
		width: 40,
		height: 4,
		backgroundColor: colors.textMuted,
		borderRadius: 2,
		alignSelf: 'center',
		marginBottom: 20,
		opacity: 0.5,
	},
	closeButton: {
		position: 'absolute',
		top: 10,
		right: screenPadding.horizontal,
		zIndex: 1,
	},
	title: {
		fontSize: fontSize.lg,
		color: colors.text,
		textAlign: 'center',
		marginBottom: 20,
		fontWeight: 'bold',
	},
	authContainer: {
		gap: 16,
	},
	signedInContainer: {
		alignItems: 'center',
		gap: 12,
		paddingVertical: 20,
	},
	userEmail: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	input: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		color: colors.text,
		padding: 16,
		borderRadius: 8,
		fontSize: fontSize.sm,
	},
	button: {
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	primaryButton: {
		backgroundColor: colors.primary,
	},
	googleButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	signOutButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		marginTop: 20,
	},
	buttonText: {
		color: colors.text,
		fontSize: fontSize.sm,
		fontWeight: '600',
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 10,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
	dividerText: {
		color: colors.textMuted,
		fontSize: fontSize.xs,
		marginHorizontal: 10,
	},
	switchMode: {
		alignItems: 'center',
		marginTop: 10,
	},
	switchModeText: {
		color: colors.textMuted,
		fontSize: fontSize.xs,
	},
})

