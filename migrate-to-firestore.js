const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const dbJson = JSON.parse(fs.readFileSync('db.json', 'utf8'));

async function migrate() {
  for (const [key, value] of Object.entries(dbJson)) {
    if (Array.isArray(value)) {
      // If it's an array, create a collection and add each item as a document
      for (const item of value) {
        // Use 'id' as document ID if present, otherwise let Firestore auto-generate
        const docRef = item.id
          ? db.collection(key).doc(String(item.id))
          : db.collection(key).doc();
        await docRef.set(item);
      }
      console.log(`Migrated collection: ${key}`);
    } else if (typeof value === 'object' && value !== null) {
      // If it's a single object, store as a document with the key as the doc ID
      await db.collection('singletons').doc(key).set(value);
      console.log(`Migrated singleton object: ${key}`);
    }
  }
  console.log('Migration complete!');
  process.exit();
}

migrate();