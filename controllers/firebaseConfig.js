const { initializeApp }= require("firebase/app");
const { getStorage }= require("firebase/storage");
const firebaseConfig = {
  apiKey: process.env.apikey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket:process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId:process.env.appId,
  measurementId:process.env.measurementId
};

const app = initializeApp(firebaseConfig);
exports.storage=getStorage(app);