// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-c97e8.firebaseapp.com",
  projectId: "mern-estate-c97e8",
  storageBucket: "mern-estate-c97e8.appspot.com",
  messagingSenderId: "807787664607",
  appId: "1:807787664607:web:f7e20c57f83302919b856a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);