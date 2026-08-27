import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDDepofDsHEvddlyni7W4g4YqjCh4upg8",
    authDomain: "weatherwatch-c70b3.firebaseapp.com",
    projectId: "weatherwatch-c70b3",
    storageBucket: "weatherwatch-c70b3.firebasestorage.app",
    messagingSenderId: "97939090519",
    appId: "1:97939090519:web:1609781631d4b36a720712",
    measurementId: "G-SWVVGSZRVR"
};

console.log('[Firebase] Initializing Firebase app with projectId:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
console.log('[Firebase] Firestore initialized.');