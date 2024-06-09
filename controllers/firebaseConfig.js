const { initializeApp }= require("firebase/app");
const { getStorage }= require("firebase/storage");
const firebaseConfig = {
  apiKey: "AIzaSyDbhQdnMBaPE7JgDeSWfgKLUMkWG_r4iSM",
  authDomain: "natours-21ccd.firebaseapp.com",
  projectId: "natours-21ccd",
  storageBucket: "natours-21ccd.appspot.com",
  messagingSenderId: "261143255911",
  appId: "1:261143255911:web:e514190819c2d89341adc2",
  measurementId: "G-X8Y3QHE2E1"
};

const app = initializeApp(firebaseConfig);
exports.storage=getStorage(app);