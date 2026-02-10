
// Use namespaced imports to handle potential named export resolution issues in this environment
import * as firebaseApp from "firebase/app";
import * as firestore from "firebase/firestore";
import { MOCK_CENTERS, MOCK_CHILDREN, MOCK_STAFF, MOCK_CLASSROOMS, MOCK_ANNOUNCEMENTS, MOCK_EVENTS } from "../constants";

// Destructure from the namespaced modules with any cast to avoid "no exported member" errors
const { initializeApp, getApps, getApp } = firebaseApp as any;
const {
  getFirestore,
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  writeBatch
} = firestore as any;

const firebaseConfig = {
  apiKey: "AIzaSyBXUDQSBp1X2icJH3jcidk0DxtiAgQpYjw",
  authDomain: "kdaycare-7ce8b.firebaseapp.com",
  projectId: "kdaycare-7ce8b",
  storageBucket: "kdaycare-7ce8b.firebasestorage.app",
  messagingSenderId: "443335642991",
  appId: "1:443335642991:web:41badcbe84526b2369629a"
};

let app: any;
let db: any = null;

/**
 * Initialize Firebase with modular SDK using a fallback approach for hot-reloading stability.
 */
const initialize = () => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      db = getFirestore(app);
      console.log("🚀 DaycareOS Firestore V11 Connected Successfully");
    } else {
      throw new Error("Firebase app failed to initialize.");
    }
  } catch (e: any) {
    console.error("❌ Firebase initialization failed:", e.message || e);
    console.debug(e);
  }
};

initialize();

export const isFirebaseEnabled = () => db !== null;

/**
 * Seed initial mock data into Firestore if collections are empty.
 */
export const seedInitialData = async () => {
  if (!db) return;
  const colls = [
    { name: 'centers', data: MOCK_CENTERS },
    { name: 'children', data: MOCK_CHILDREN },
    { name: 'staff', data: MOCK_STAFF },
    { name: 'classrooms', data: MOCK_CLASSROOMS },
    { name: 'announcements', data: MOCK_ANNOUNCEMENTS },
    { name: 'events', data: MOCK_EVENTS }
  ];

  for (const coll of colls) {
    try {
      const snap = await getDocs(collection(db, coll.name));
      if (snap.empty) {
        console.log(`🌱 Seeding initial data for ${coll.name}...`);
        const batch = writeBatch(db);
        coll.data.forEach((item: any) => {
          const ref = doc(db!, coll.name, item.id);
          batch.set(ref, item);
        });
        await batch.commit();
      }
    } catch (err) {
      console.error(`Error seeding ${coll.name}:`, err);
    }
  }
};

/**
 * Subscribe to real-time updates for a specific Firestore collection.
 */
export const subscribeToCollection = (name: string, callback: (data: any[]) => void) => {
  if (!db) {
    console.warn(`Attempted to subscribe to ${name} but Firestore is not initialized.`);
    return () => { };
  }
  const q = query(collection(db, name));
  return onSnapshot(q, (snap: any) => {
    callback(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
  }, (error: any) => {
    console.error(`Firestore subscription error (${name}):`, error);
  });
};

/**
 * Update specific fields in a Firestore document.
 */
export const updateFirestoreDoc = async (collName: string, docId: string, data: any) => {
  if (!db) return;
  try {
    const ref = doc(db, collName, docId);
    await updateDoc(ref, data);
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collName}:`, error);
  }
};

/**
 * Create or overwrite a Firestore document.
 */
export const setFirestoreDoc = async (collName: string, docId: string, data: any) => {
  if (!db) return;
  try {
    const ref = doc(db, collName, docId);
    await setDoc(ref, data);
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collName}:`, error);
  }
};
