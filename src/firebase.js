import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded, set, onValue } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgaDBhj0fll2E2EfN3re_To-EKQGzFyLs",
  authDomain: "fan-platform-chat.firebaseapp.com",
  databaseURL: "https://fan-platform-chat-default-rtdb.firebaseio.com",
  projectId: "fan-platform-chat",
  storageBucket: "fan-platform-chat.firebasestorage.app",
  messagingSenderId: "853603372393",
  appId: "1:853603372393:web:4757137b0070d3737781f8"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, ref, push, onChildAdded, set, onValue, auth, signInAnonymously };