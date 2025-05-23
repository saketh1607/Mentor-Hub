import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";

//Mentor-Hub
const firebaseConfig = {
  apiKey: "AIzaSyAV9YdOZKn_WMIusmPYHcKnCY4RQfBjC88",
  authDomain: "quickbite-45bc4.firebaseapp.com",
  projectId: "quickbite-45bc4",
  storageBucket: "quickbite-45bc4.appspot.com",
  messagingSenderId: "851454204708",
  appId: "1:851454204708:web:2e40d8af33ccf1ffaab1b1",
  measurementId: "G-08DLVV5T8G",
  databaseURL: "https://quickbite-45bc4-default-rtdb.firebaseio.com"
};

// Initialize Firebase with a unique name to avoid conflicts
const app = initializeApp(firebaseConfig, 'mentor-hub-app');

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize Realtime Database
const realtime = getDatabase(app);

// Set up connection monitoring
const connectedRef = ref(realtime, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('Realtime Database connection active');
  } else {
    console.warn('Realtime Database connection lost');
  }
});

// Set up auth persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Auth persistence error:', error);
  });

export { auth, storage, db, realtime };