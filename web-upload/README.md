# Music Uploader Web Interface

A simple web interface for uploading songs to your Firebase-hosted music player.

## Setup

1. **Configure Firebase**
   - Open `upload.js`
   - Replace the Firebase configuration with your actual Firebase project credentials:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```
   - You can find these values in Firebase Console > Project Settings > General > Your apps

2. **Open the Interface**
   - ⚠️ **Important**: You MUST serve this through a web server (not open directly with `file://`)
   - ES modules require HTTP/HTTPS protocol due to CORS restrictions
   
   **Quick Start - Use the included script:**
   ```bash
   cd web-upload
   ./serve.sh
   ```
   Then open `http://localhost:8000` in your browser
   
   **Or manually:**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Python 2
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   ```
   Then navigate to `http://localhost:8000`

## Usage

1. **Upload Songs** (No sign-in required!)
   - Select an audio file (MP3, M4A, etc.)
   - Enter the song title (required)
   - Optionally add artist, album
   - Add artwork: either upload an image file or provide a URL
   - Click "Upload Song"

2. **Sync to Mobile App**
   - Open the mobile app
   - Pull to refresh on the Songs screen
   - Your uploaded songs will appear!

## Features

- ✅ No sign-in required - anyone can upload!
- ✅ Upload audio files to Firebase Storage
- ✅ Add track metadata (title, artist, album)
- ✅ Upload artwork image or provide artwork URL
- ✅ Automatic download URL generation
- ✅ Progress feedback during upload
- ✅ Shared music library - everyone sees the same songs

## File Structure

Songs are stored in Firebase at:
- **Storage**: `songs/{filename}` (shared location)
- **Firestore**: `tracks/{trackId}` (shared collection)

## Notes

- Audio files are uploaded to Firebase Storage (shared location)
- Track metadata is saved in Firestore (shared collection)
- The mobile app will automatically convert Storage paths to download URLs
- **⚠️ IMPORTANT**: You MUST update your Firebase Security Rules or you'll get permission errors!
  
  See `FIREBASE_SECURITY_RULES.md` in the project root for detailed instructions.
  
  Quick rules to add:
  
  **Firestore Rules:**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /tracks/{trackId} {
        allow read: if true;
        allow write: if true;
      }
    }
  }
  ```
  
  **Storage Rules:**
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /songs/{songId} {
        allow read: if true;
        allow write: if true;
      }
      match /artwork/{artworkId} {
        allow read: if true;
        allow write: if true;
      }
    }
  }
  ```

