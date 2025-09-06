import 'dotenv/config';
import { db } from '../src/lib/firebase.js';
process.on('unhandledRejection', (r) => console.error('unhandledRejection', r));
process.on('uncaughtException', (e) => console.error('uncaughtException', e));

async function ping() {
console.log('cwd:', process.cwd());
console.log('Env check:', {
FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
HAS_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
USE_FIRESTORE_EMULATOR: process.env.USE_FIRESTORE_EMULATOR,
});
const id = 'ping-' + Date.now();
await db.collection('debug').doc(id).set({ at: Date.now() });
console.log('Wrote debug/' + id);
}
ping().then(() => process.exit(0));