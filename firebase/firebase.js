// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKpbc58podDsRMHMjbDCo6JYqDjk_EBM4",
  authDomain: "mannahdb-299dc.firebaseapp.com",
  projectId: "mannahdb-299dc",
  storageBucket: "mannahdb-299dc.appspot.com",
  messagingSenderId: "595077926550",
  appId: "1:595077926550:web:c2c4c71bd2f3680e963cb7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)