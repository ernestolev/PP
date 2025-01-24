
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'



const firebaseConfig = {
  apiKey: "AIzaSyALZgcgnF6Tdg_cC0NWKbnDuOxJvRTfmfA",
  authDomain: "play-place-peru.firebaseapp.com",
  projectId: "play-place-peru",
  storageBucket: "play-place-peru.firebasestorage.app",
  messagingSenderId: "395846546140",
  appId: "1:395846546140:web:5f8bf3a9936b6926087a19",
  measurementId: "G-5QW0WBE253"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)