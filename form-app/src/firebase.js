import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXTN8XybbFBNr9ukioznlz1wzI3R8PA6M",
  authDomain: "dashboardmf-1468f.firebaseapp.com",
  projectId: "dashboardmf-1468f",
  storageBucket: "dashboardmf-1468f.firebasestorage.app",
  messagingSenderId: "641560955295",
  appId: "1:641560955295:web:90d08df3eaba736a26d5aa",
  measurementId: "G-SFC6HB3Y8V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);