import admin from 'firebase-admin';

const useEmu = process.env.USE_FIRESTORE_EMULATOR === 'true';
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  let options: admin.AppOptions;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Firebase Admin: using applicationDefault()');
    options = {
      credential: admin.credential.applicationDefault(),
    };
  } else {
    console.log('Firebase Admin: using service account env vars');
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing Firebase env vars (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)');
    }
    options = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    };
  }

  // Attach the bucket name here (top-level app option)
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET; // e.g., my-project.appspot.com
  }

  admin.initializeApp(options);
}

const db = admin.firestore();
console.log(
  'Firebase Admin initialized.',
  'Project:', process.env.FIREBASE_PROJECT_ID,
  'Storage bucket:', admin.app().options.storageBucket || '(none)',
  'Emulator:', useEmu
);

if (useEmu) {
  const host = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  db.settings({ host, ssl: false });
  process.env.FIRESTORE_EMULATOR_HOST = host;
  console.log('Connected to Firestore emulator at', host);
}

export { admin, db };