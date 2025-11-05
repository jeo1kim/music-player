# Firebase Security Rules

You need to update your Firebase Security Rules to allow public access to the shared music library.

## Firestore Rules

Go to Firebase Console > Firestore Database > Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write to tracks collection (shared library)
    match /tracks/{trackId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Storage Rules

Go to Firebase Console > Storage > Rules and update to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read/write to songs
    match /songs/{songId} {
      allow read: if true;
      allow write: if true;
    }
    // Allow public read/write to artwork
    match /artwork/{artworkId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Steps to Update

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Rules** tab
4. Paste the Firestore rules above
5. Click **Publish**
6. Navigate to **Storage** > **Rules** tab
7. Paste the Storage rules above
8. Click **Publish**

⚠️ **Important**: These rules allow anyone to read and write. If you want to restrict writes while keeping reads public, you can modify the `allow write` rules to require authentication or add additional validation.

