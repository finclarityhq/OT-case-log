import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// Important: This file should not be used in the client-side code.
let app: App;

if (!getApps().length) {
  try {
    // Attempt to initialize with service account credentials from environment variables
    // This is the recommended way for secure environments like Firebase App Hosting
    app = initializeApp();
  } catch (e) {
    console.warn(
      'Server-side Firebase Admin initialization with default credentials failed. ' +
      'This is expected in a local development environment. Falling back to client-side config. ' +
      'For production, ensure SERVICE_ACCOUNT environment variable is set.',
      e
    );
    // Fallback for local development where server env vars might not be set.
    // NOTE: This uses client-side config for convenience but is NOT recommended for production server environments.
    app = initializeApp({
        credential: cert({
            projectId: firebaseConfig.projectId,
            clientEmail: `firebase-adminsdk-virtual@${firebaseConfig.projectId}.iam.gserviceaccount.com`,
            privateKey: '',
        }),
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
    });
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export async function getDb() {
  return db;
}
