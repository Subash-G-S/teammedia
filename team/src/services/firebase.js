import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBrsmy8ZATRX1mK0ZgUzMghpAyXgJx0bEQ",
  authDomain: "teammedia-9d5b2.firebaseapp.com",
  projectId: "teammedia-9d5b2",
  storageBucket: "teammedia-9d5b2.firebasestorage.app",
  messagingSenderId: "644363372952",
  appId: "1:644363372952:web:84260016db03cc6e1ec3ed"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)