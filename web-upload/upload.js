// Define functions first so they're available even if Firebase fails to initialize
// File handling
window.handleFileSelect = function (event) {
	const file = event.target.files[0]
	if (file) {
		const label = document.getElementById('fileLabel')
		const labelText = document.getElementById('fileLabelText')
		const hint = document.getElementById('audioFileHint')
		const hintText = document.getElementById('audioFileHintText')

		label.classList.add('has-file')
		labelText.textContent = `Selected: ${file.name}`

		// Show hint
		hint.classList.remove('hidden')
		hintText.textContent = `${file.name} (${window.formatFileSize(file.size)})`
	}
}

window.formatFileSize = function (bytes) {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Artwork file handling
window.handleArtworkFileSelect = function (event) {
	const file = event.target.files[0]
	if (file) {
		artworkFile = file
		const label = document.getElementById('artworkFileLabel')
		const labelText = document.getElementById('artworkFileLabelText')
		const hint = document.getElementById('artworkFileHint')
		const hintText = document.getElementById('artworkFileHintText')
		const preview = document.getElementById('artworkFilePreview')
		const urlHint = document.getElementById('artworkUrlHint')
		const urlPreview = document.getElementById('artworkUrlPreview')

		label.classList.add('has-file')
		labelText.textContent = `Selected: ${file.name}`

		// Show hint
		hint.classList.remove('hidden')
		hintText.textContent = `${file.name} (${window.formatFileSize(file.size)})`

		// Show preview
		const reader = new FileReader()
		reader.onload = (e) => {
			preview.src = e.target.result
			preview.classList.remove('hidden')
		}
		reader.readAsDataURL(file)

		// Clear URL input and hints if file is selected
		document.getElementById('artworkUrl').value = ''
		urlHint.classList.add('hidden')
		urlPreview.classList.add('hidden')
		urlPreview.src = ''
	}
}

// Artwork URL input handling
window.handleArtworkUrlInput = function (event) {
	const url = event.target.value.trim()
	const urlHint = document.getElementById('artworkUrlHint')
	const urlPreview = document.getElementById('artworkUrlPreview')
	const fileHint = document.getElementById('artworkFileHint')
	const filePreview = document.getElementById('artworkFilePreview')

	if (url) {
		// Show URL hint
		urlHint.classList.remove('hidden')

		// Try to show preview
		urlPreview.src = url
		urlPreview.onload = () => {
			urlPreview.classList.remove('hidden')
		}
		urlPreview.onerror = () => {
			urlPreview.classList.add('hidden')
		}

		// Clear file input if URL is provided
		artworkFile = null
		const fileInput = document.getElementById('artworkFile')
		if (fileInput) {
			fileInput.value = ''
		}
		const label = document.getElementById('artworkFileLabel')
		const labelText = document.getElementById('artworkFileLabelText')
		label.classList.remove('has-file')
		labelText.textContent = 'Upload artwork image (JPG, PNG, etc.)'
		fileHint.classList.add('hidden')
		filePreview.classList.add('hidden')
		filePreview.src = ''
	} else {
		// Hide hints if URL is cleared
		urlHint.classList.add('hidden')
		urlPreview.classList.add('hidden')
		urlPreview.src = ''
	}
}

// Firebase configuration - Replace with your Firebase config
// You can get this from Firebase Console > Project Settings > General > Your apps
// Or from your .env file (EXPO_PUBLIC_FIREBASE_* variables)
const firebaseConfig = {
	apiKey: 'AIzaSyDXgX50vo5zjHin7evZky0N1EesBSJXHJ4',
	authDomain: 'grace-player-1bc24.firebaseapp.com',
	projectId: 'grace-player-1bc24',
	storageBucket: 'grace-player-1bc24.firebasestorage.app',
	messagingSenderId: '83930785529',
	appId: '1:83930785529:web:e67bf9f92a051596fde428',
}

// TODO: Replace the values above with your actual Firebase configuration
// You can find them in:
// - Firebase Console > Project Settings > General > Your apps > Web app
// - Or copy from your .env file variables (EXPO_PUBLIC_FIREBASE_*)

// State
let artworkFile = null
let storage = null
let db = null

// Initialize Firebase (async IIFE to handle dynamic imports)
;(async function () {
	try {
		// Import Firebase modules (no auth needed)
		const { initializeApp } = await import(
			'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
		)
		const { getStorage, ref, uploadBytes, getDownloadURL } = await import(
			'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'
		)
		const { getFirestore, collection, addDoc } = await import(
			'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
		)

		// Initialize Firebase
		const app = initializeApp(firebaseConfig)
		storage = getStorage(app)
		db = getFirestore(app)

		// Make Firebase functions available globally
		window.ref = ref
		window.uploadBytes = uploadBytes
		window.getDownloadURL = getDownloadURL
		window.collection = collection
		window.addDoc = addDoc

		console.log('Firebase initialized successfully')
	} catch (error) {
		console.error('Firebase initialization error:', error)
		if (window.showMessage) {
			window.showMessage(
				'Firebase configuration error. Please check your Firebase config.',
				'error',
			)
		}
	}
})()

// Show upload form immediately (no auth required)
document.addEventListener('DOMContentLoaded', () => {
	const uploadForm = document.getElementById('uploadForm')
	if (uploadForm) {
		uploadForm.classList.remove('hidden')
	}
})

// Form submission
window.handleSubmit = async function (event) {
	event.preventDefault()

	const fileInput = document.getElementById('audioFile')
	const file = fileInput.files[0]

	if (!file) {
		window.showMessage('Please select an audio file', 'error')
		return
	}

	const submitBtn = document.getElementById('submitBtn')
	const originalText = submitBtn.textContent
	submitBtn.disabled = true
	submitBtn.innerHTML = '<span class="loading"></span>Uploading...'

	try {
		// Get form data
		const title = document.getElementById('title').value.trim()
		const artist = document.getElementById('artist').value.trim()
		const album = document.getElementById('album').value.trim()
		const artworkUrl = document.getElementById('artworkUrl').value.trim()

		// Check if Firebase is initialized
		if (
			!storage ||
			!db ||
			!window.ref ||
			!window.uploadBytes ||
			!window.getDownloadURL ||
			!window.collection ||
			!window.addDoc
		) {
			window.showMessage(
				'Firebase not initialized. Please check your Firebase configuration.',
				'error',
			)
			return
		}

		// Upload audio file to shared Storage location
		const fileName = `${Date.now()}_${file.name}`
		const storageRef = window.ref(storage, `songs/${fileName}`)

		window.showMessage('Uploading audio file...', 'info')
		await window.uploadBytes(storageRef, file)

		// Get download URL
		const downloadURL = await window.getDownloadURL(storageRef)

		// Handle artwork - upload file or use provided URL
		let artwork = artworkUrl
		if (artworkFile) {
			window.showMessage('Uploading artwork...', 'info')
			const artworkFileName = `${Date.now()}_${artworkFile.name}`
			const artworkStorageRef = window.ref(storage, `artwork/${artworkFileName}`)
			await window.uploadBytes(artworkStorageRef, artworkFile)
			artwork = await window.getDownloadURL(artworkStorageRef)
		}

		// Create Firestore document in shared collection
		const trackData = {
			url: downloadURL,
			title: title,
			artist: artist || '',
			artwork: artwork || '',
			rating: 0,
			playlist: [],
			album: album || '',
			duration: null, // You can extract this from audio file metadata if needed
			createdAt: new Date().toISOString(),
		}

		window.showMessage('Saving track information...', 'info')
		await window.addDoc(window.collection(db, 'tracks'), trackData)

		// Reset form
		document.getElementById('songForm').reset()

		// Reset audio file
		const fileLabel = document.getElementById('fileLabel')
		const fileLabelText = document.getElementById('fileLabelText')
		const audioFileHint = document.getElementById('audioFileHint')
		fileLabel.classList.remove('has-file')
		fileLabelText.textContent = 'Click to select audio file (MP3, M4A, etc.)'
		audioFileHint.classList.add('hidden')

		// Reset artwork
		const artworkFileLabel = document.getElementById('artworkFileLabel')
		const artworkFileLabelText = document.getElementById('artworkFileLabelText')
		const artworkFileHint = document.getElementById('artworkFileHint')
		const artworkFilePreview = document.getElementById('artworkFilePreview')
		const artworkUrlHint = document.getElementById('artworkUrlHint')
		const artworkUrlPreview = document.getElementById('artworkUrlPreview')

		artworkFileLabel.classList.remove('has-file')
		artworkFileLabelText.textContent = 'Upload artwork image (JPG, PNG, etc.)'
		artworkFileHint.classList.add('hidden')
		artworkFilePreview.classList.add('hidden')
		artworkFilePreview.src = ''
		artworkUrlHint.classList.add('hidden')
		artworkUrlPreview.classList.add('hidden')
		artworkUrlPreview.src = ''
		artworkFile = null

		window.showMessage('Song uploaded successfully! 🎵', 'success')
	} catch (error) {
		console.error('Upload error:', error)
		window.showMessage(`Error: ${error.message}`, 'error')
	} finally {
		submitBtn.disabled = false
		submitBtn.textContent = originalText
	}
}

// Message display
window.showMessage = function (message, type) {
	const messageDiv = document.getElementById('message')
	messageDiv.textContent = message
	messageDiv.className = `message message-${type}`
	messageDiv.classList.remove('hidden')

	// Auto-hide after 5 seconds for success/info messages
	if (type === 'success' || type === 'info') {
		setTimeout(() => {
			messageDiv.classList.add('hidden')
		}, 5000)
	}
}
