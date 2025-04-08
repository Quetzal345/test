import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPboC2ne2hpcqPno9SFds9GX2FGnYzeBk",
    authDomain: "sports-ia-bd2ad.firebaseapp.com",
    projectId: "sports-ia-bd2ad",
    storageBucket: "sports-ia-bd2ad.appspot.com", // Corregido el dominio
    messagingSenderId: "906940410216",
    appId: "1:906940410216:web:bfad2db7966fc25b854edd",
    measurementId: "G-2LCG1LVE3T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };