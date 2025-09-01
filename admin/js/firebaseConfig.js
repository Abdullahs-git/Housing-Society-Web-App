// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, push, set, get, equalTo, orderByChild, query, remove, update,onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPujmzWYgPATJiHJ2vRJdngGM4--Be3jM",
  authDomain: "society-57457.firebaseapp.com",
  databaseURL: "https://society-57457-default-rtdb.firebaseio.com",
  projectId: "society-57457",
  storageBucket: "society-57457.firebasestorage.app",
  messagingSenderId: "1513819947",
  appId: "1:1513819947:web:3004323447bfc6e336ff6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Export Firebase instances for use in other files
export { auth, db, ref, push, set, get, createUserWithEmailAndPassword, app, getAuth, equalTo, orderByChild, query, remove, update,getDatabase,onValue };