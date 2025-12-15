import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTqDPmUiDnnuJNQPBrXJFqByFj0FiletA",
  authDomain: "mixel-22133.firebaseapp.com",
  projectId: "mixel-22133",
  appId: "1:407899219850:web:f98738b953c788821a8a73"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
